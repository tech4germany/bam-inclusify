function computeScrollbarWidth() {
  const oldOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  var width = document.body.clientWidth;
  document.body.style.overflow = "scroll";
  width -= document.body.clientWidth;
  if (!width) width = document.body.offsetWidth - document.body.clientWidth;
  document.body.style.overflow = oldOverflow;
  return width;
}

export const scrollbarWidth = computeScrollbarWidth();
