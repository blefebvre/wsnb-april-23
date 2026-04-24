// Page metadata block - handled by publishing pipeline, no-op at runtime.
// Remove the block element from the DOM so it doesn't render.
export default function decorate(block) {
  block.remove();
}
