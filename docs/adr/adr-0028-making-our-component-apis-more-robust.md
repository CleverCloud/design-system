---
kind: '📌 Architecture Decision Records'
---
# ADR 0026: Component states

<!-- TODO: change the date -->
🗓️ 2023-03-.. · ✍️ Florian Sanders

## Making our component APIs more robust

### The old way

Most of our components deal with async data.
Our oldest components used to base their logic on whether properties handling data were set or not to determine whether to show a loader or data.
They also used to expose an `error` boolean property to be used when data fetching had failed.

This was very HTML friendly but it meant that you could set `error` to `true` and pass `data` at the same time:

```html
<cc-fake-component error data="toto"></cc-fake-component>
```

Inside the component, our rendering logic would look something like this:

```js
render () {
  if (this.error) {
    return html`<cc-notice intent="warning"></cc-notice>`
  }

  if (this.data == null) {
    return html`<cc-loader></cc-loader>`;
  }

  return html`
    <p>Your data: ${this.data}</p>
  `;
```

The API did not offer any guidance on how to avoid impossible states and preventing silly mistakes.
There was also an issue with `empty` states: if `nullish` data means it's loading, how do you represent empty data?

### The more robust way

Components can usually be set to different states that are mutually exclusive:

- `loading` when initial data to be displayed is being fetched,
- `loaded` once initial data has been fetched and is displayed,
- `error` if something has gone wrong when trying to fetch initial data,
- `saving` when an async operation is pending, for instance after submitting a form, we're waiting for the result of our action.

Component consumers should not be able to set a given component both to `loading` and `loaded` at the same time.

This is why we introduced object properties associated to TypeScript interfaces.

This property is usually named `state`.
In a `state` object, there's always at least a `type` property.
The state type is a string that represents the state of the component like `"loading"`, `"loaded"` or `"error"`.
The `type` property is enough to make sure the component is not both `loading` and `loaded`.
We also decided to make async data part of the state so that we have types that only accept data if the state type is `loaded`:

```ts
// this type should be applied to the component prop conveying the state
export type MyComponentState = MyComponentStateLoaded | MyComponentStateLoading | MyComponentStateError

// `loading` and `error` states usually are fairly simple since they have no data
interface MyComponentStateLoading {
  type: 'loading';
}

interface MyComponentStateError {
  type: 'error';
}

// usually we try to make the state prop as flat as possible
interface MyComponentStateLoaded {
  type: 'loaded';
  avatar: string; // this is just an example of data
  name: string; // this is just an example of data
}
```

The component logic looks like this:

```ts
/**
 * @typedef {import('./my-component-name.types.js'.MyComponentState) MyComponentState}
 */

export class MyComponent extends LitElement {
  static get Properties () {
    return {
      state: { type: Object },
    };
  }

  constructor () {
    super();

    /* @type {MyComponentState} a short description */
    // usually the initial state is `loading` but feel free to adapt this example
    this.state = { type: 'loading' };
  }

  render () {
    if (this.state.type === 'loading') {
      return html`<cc-loader></cc-loader>`;
    }

    if (this.state.type === 'error') {
      return html`<cc-notice intent="warning">${i18n('your-warning-translation')}</cc-notice>`;
    }

    // you can pass data to your loaded subRender function
    return this._renderLoaded(...);
  }
}
```

This subject is covered more extensively in [How to deal with complex component states / data? - Web Components Guildelines](https://www.clever-cloud.com/doc/clever-components/?path=/docs/%F0%9F%91%8B-contributing-web-components-guidelines--docs).
