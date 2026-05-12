(function () {
  'use strict';

  // ---- Config (filled in by Marty during setup; see studio/SETUP.md) ----
  var PROJECT_ID = 'REPLACE_ME';
  var DATASET = 'production';
  var API_VERSION = '2024-10-01';

  var CDN_QUERY = 'https://' + PROJECT_ID + '.apicdn.sanity.io/v' + API_VERSION + '/data/query/' + DATASET;
  var CDN_IMAGE = 'https://cdn.sanity.io/images/' + PROJECT_ID + '/' + DATASET + '/';

  function isConfigured() {
    return PROJECT_ID && PROJECT_ID !== 'REPLACE_ME';
  }

  /* -------------------- Fetch helpers -------------------- */

  function runQuery(groq, params) {
    var url = CDN_QUERY + '?query=' + encodeURIComponent(groq);
    if (params) {
      Object.keys(params).forEach(function (k) {
        url += '&$' + k + '=' + encodeURIComponent(JSON.stringify(params[k]));
      });
    }
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Sanity query failed: ' + r.status);
      return r.json();
    }).then(function (j) {
      return j.result;
    });
  }

  var POST_FIELDS = '_id, title, "slug": slug.current, category, subtag, excerpt, publishedAt, heroImage';

  function fetchPostList() {
    var groq =
      '*[_type == "journalPost" && publishedAt <= now()] | order(publishedAt desc) {' +
      POST_FIELDS +
      '}';
    return runQuery(groq);
  }

  function fetchPostBySlug(slug) {
    var groq =
      '*[_type == "journalPost" && slug.current == $slug && publishedAt <= now()][0] {' +
      POST_FIELDS + ', body' +
      '}';
    return runQuery(groq, {slug: slug});
  }

  /* -------------------- Image URLs -------------------- */
  // Sanity image asset refs look like: image-{hash}-{w}x{h}-{ext}
  // CDN URL pattern: https://cdn.sanity.io/images/{projectId}/{dataset}/{hash}-{w}x{h}.{ext}

  function imageUrl(image, opts) {
    if (!image || !image.asset || !image.asset._ref) return '';
    var ref = image.asset._ref; // image-abc123def456-1600x900-jpg
    var parts = ref.split('-');
    if (parts.length < 4) return '';
    var ext = parts.pop();
    var dim = parts.pop();
    var hash = parts.slice(1).join('-');
    var base = CDN_IMAGE + hash + '-' + dim + '.' + ext;

    opts = opts || {};
    var q = [];
    if (opts.w) q.push('w=' + opts.w);
    if (opts.h) q.push('h=' + opts.h);
    if (opts.fit) q.push('fit=' + opts.fit);
    q.push('auto=format');
    q.push('q=' + (opts.q || 80));
    return base + '?' + q.join('&');
  }

  /* -------------------- PortableText → HTML -------------------- */
  // Minimal renderer covering: normal/h2/h3/blockquote, bullet/number lists,
  // strong/em marks, link annotations, and inline images.

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSpan(span, markDefs) {
    var text = escapeHtml(span.text);
    var marks = span.marks || [];
    marks.forEach(function (m) {
      if (m === 'strong') text = '<strong>' + text + '</strong>';
      else if (m === 'em') text = '<em>' + text + '</em>';
      else {
        var def = (markDefs || []).find(function (d) { return d._key === m; });
        if (def && def._type === 'link' && def.href) {
          var href = escapeHtml(def.href);
          var external = /^https?:/i.test(def.href) ? ' target="_blank" rel="noopener"' : '';
          text = '<a href="' + href + '"' + external + '>' + text + '</a>';
        }
      }
    });
    return text;
  }

  function renderBlock(block) {
    var children = (block.children || [])
      .map(function (c) { return renderSpan(c, block.markDefs); })
      .join('');
    var style = block.style || 'normal';
    if (style === 'h2') return '<h2 class="journal-h2">' + children + '</h2>';
    if (style === 'h3') return '<h3 class="journal-h3">' + children + '</h3>';
    if (style === 'blockquote') return '<blockquote class="journal-quote">' + children + '</blockquote>';
    return '<p class="journal-p">' + children + '</p>';
  }

  function renderListItem(block) {
    var children = (block.children || [])
      .map(function (c) { return renderSpan(c, block.markDefs); })
      .join('');
    return '<li>' + children + '</li>';
  }

  function renderImageBlock(img) {
    var src = imageUrl(img, {w: 1400});
    if (!src) return '';
    var alt = escapeHtml(img.alt || '');
    var caption = img.caption ? '<figcaption class="journal-caption">' + escapeHtml(img.caption) + '</figcaption>' : '';
    return '<figure class="journal-figure"><img src="' + src + '" alt="' + alt + '" loading="lazy" />' + caption + '</figure>';
  }

  function portableToHtml(blocks) {
    if (!blocks || !blocks.length) return '';
    var out = [];
    var i = 0;
    while (i < blocks.length) {
      var b = blocks[i];
      if (b._type === 'image') {
        out.push(renderImageBlock(b));
        i++;
        continue;
      }
      if (b._type === 'block' && (b.listItem === 'bullet' || b.listItem === 'number')) {
        var tag = b.listItem === 'number' ? 'ol' : 'ul';
        var items = [];
        while (i < blocks.length && blocks[i].listItem === b.listItem) {
          items.push(renderListItem(blocks[i]));
          i++;
        }
        out.push('<' + tag + ' class="journal-list">' + items.join('') + '</' + tag + '>');
        continue;
      }
      if (b._type === 'block') {
        out.push(renderBlock(b));
        i++;
        continue;
      }
      i++; // unknown block type — skip
    }
    return out.join('\n');
  }

  /* -------------------- Date formatting -------------------- */

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
  }

  /* -------------------- Public API -------------------- */
  window.LaVidaSanity = {
    isConfigured: isConfigured,
    fetchPostList: fetchPostList,
    fetchPostBySlug: fetchPostBySlug,
    imageUrl: imageUrl,
    portableToHtml: portableToHtml,
    formatDate: formatDate,
    escapeHtml: escapeHtml,
  };
})();
