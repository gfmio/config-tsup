export class TodoList {
  constructor(private selector: string, private api: any) {}

  async render() {
    const container = document.querySelector(this.selector);
    if (container) {
      container.innerHTML = '<div>Todo List Component</div>';
    }
  }
}