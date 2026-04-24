export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-news-${cols.length}-cols`);

  block.querySelectorAll('.button').forEach((btn) => {
    btn.className = '';
    const container = btn.closest('.button-container');
    if (container) container.className = '';
  });
}
