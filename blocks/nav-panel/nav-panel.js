/**
 * Nav Panel block — renders a grid of navigation panels.
 *
 * Content model (each row is one panel):
 *   Column 1: heading text (e.g. "Health & Safety")
 *   Column 2: list of links (always shown)
 *   Column 3 (optional): list of additional links (hidden until "View All")
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'nav-panel-grid';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const headingCell = cells[0];
    const shownCell = cells[1];
    const hiddenCell = cells[2];

    const li = document.createElement('li');
    li.className = 'nav-panel-item';

    const header = document.createElement('div');
    header.className = 'nav-panel-header';
    header.textContent = headingCell ? headingCell.textContent.trim() : '';
    li.append(header);

    const body = document.createElement('div');
    body.className = 'nav-panel-body';

    const shownList = shownCell ? shownCell.querySelector('ul, ol') : null;
    if (shownList) {
      shownList.classList.add('nav-panel-list', 'nav-panel-list-shown');
      body.append(shownList);
    }

    const hiddenList = hiddenCell ? hiddenCell.querySelector('ul, ol') : null;
    if (hiddenList && hiddenList.children.length > 0) {
      hiddenList.classList.add('nav-panel-list', 'nav-panel-list-hidden');
      hiddenList.hidden = true;
      body.append(hiddenList);

      const toggle = document.createElement('a');
      toggle.className = 'nav-panel-toggle';
      toggle.href = '#';
      toggle.textContent = 'View All';
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        hiddenList.hidden = expanded;
        toggle.textContent = expanded ? 'View All' : 'Show Less';
      });
      body.append(toggle);
    }

    li.append(body);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
