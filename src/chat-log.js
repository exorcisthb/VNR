export class ChatLog {
  constructor(list, latestButton) {
    this.list = list;
    this.latestButton = latestButton;
    list.addEventListener('scroll', () => {
      if (this.atLatest()) latestButton.hidden = true;
    });
    latestButton.addEventListener('click', () => this.scrollToLatest());
  }
  atLatest() {
    return this.list.scrollHeight - this.list.clientHeight - this.list.scrollTop <= 24;
  }
  scrollToLatest() {
    this.list.scrollTop = this.list.scrollHeight;
    this.latestButton.hidden = true;
  }
  append(name, text) {
    const followLatest = this.atLatest();
    const doc = this.list.ownerDocument;
    const item = doc.createElement('li');
    const author = doc.createElement('b');
    author.textContent = name + ': ';
    item.append(author, doc.createTextNode(text));
    this.list.append(item);
    if (followLatest) this.scrollToLatest();
    else this.latestButton.hidden = false;
  }
  reset() {
    this.list.replaceChildren();
    this.list.scrollTop = 0;
    this.latestButton.hidden = true;
  }
}

export function opensChat(event, { playing, paused, typing }) {
  return playing && !paused && !typing && !event.isComposing &&
    (event.code === 'Enter' || event.code === 'NumpadEnter');
}
