export function Logo() {
  return (
    <img
      src={chrome.runtime.getURL('icon-128.png')}
      alt="Lovable Logo"
      className="size-4 opacity-70 rounded self-center"
      draggable="false"
    />
  );
}
