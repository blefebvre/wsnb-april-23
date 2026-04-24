/**
 * Cards Overlay block
 * Content model (per row = per card):
 *   Column 1: image (picture or img)
 *   Column 2: label text with optional link wrap (caption overlay)
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const children = [...row.children];
    const imageCol = children[0];
    const textCol = children[1] || null;

    const picture = imageCol ? imageCol.querySelector('picture, img') : null;
    const label = textCol ? (textCol.querySelector('p') || textCol) : null;
    const link = textCol ? textCol.querySelector('a') : null;

    const inner = document.createElement(link ? 'a' : 'div');
    inner.className = 'cards-overlay-card';
    if (link) {
      inner.href = link.getAttribute('href');
      if (link.getAttribute('title')) inner.title = link.getAttribute('title');
    }

    if (picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'cards-overlay-card-image';
      imgWrap.append(picture);
      inner.append(imgWrap);
    }

    if (label) {
      const caption = document.createElement('div');
      caption.className = 'cards-overlay-card-caption';
      const p = document.createElement('p');
      p.textContent = label.textContent.trim();
      caption.append(p);
      inner.append(caption);
    }

    li.append(inner);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
