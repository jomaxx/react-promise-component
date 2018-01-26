# react-promise-component

Sane promise chaining for React!

## Install

```
npm i react-promise-component react --save
```

## Usage

```js
import React from 'react';
import { render } from 'react-dom';
import createPromiseComponent from 'react-promise-component';

const fetchTracks = q =>
  fetch(`https://api.spotify.com/v1/search?q=${q}&type=track`, {
    headers: {
      Accept: 'application/json',
      // get access token from https://developer.spotify.com/web-api/console/get-search-item/
      Authorization: `Bearer {accessToken}`,
    },
  });

const defaultState = {
  value: '',
  results: undefined,
  error: undefined,
};

class App extends React.Component {
  componentWillMount() {
    this.setState({
      ...defaultState,
    });
  }

  // Uncaught errors from the Search component will hit this error boundary.
  // https://reactjs.org/docs/error-boundaries.html
  componentDidCatch(error) {
    this.setState({ error });
  }

  onChange = e => {
    this.setState({
      ...defaultState,
      value: e.target.value,
    });
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextState.value !== this.state.value) {
      this.Search =
        nextState.value &&
        createPromiseComponent(nextState.value)
          // the promise chain starts executing when the Search component mounts
          .then(fetchTracks)
          .then(r => r.clone().json())
          // if the Search component unmounts before we reach here, then this callback will not execute
          .then(results => this.setState({ results }));
    }
  }

  render() {
    const { value, results, error } = this.state;

    if (error) {
      return <div>An error occurred!</div>;
    }

    return (
      <div>
        <input type="text" onChange={this.onChange} value={value} />

        {results &&
          results.tracks.items.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}

        {this.Search && <this.Search />}
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
```

## API

### `createPromiseComponent(<Promise|any>) => <PromiseComponent>`

Creates a PromiseComponent that starts execution of it's promise chain when mounted and halts execution of the promise chain when unmounted.

### `PromiseComponent.then(<Function>, <Function>) => <PromiseComponent>`

Similar to [Promise.prototype.then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then).

### `PromiseComponent.catch(<Function>) => <PromiseComponent>`

Similar to [Promise.prototype.catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch).

### `PromiseComponent.finally(<Function>) => <PromiseComponent>`

Similar to [Promise.prototype.finally](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally).

## Uncaught errors

Uncaught errors in the promise chain will bubble up the React tree until it hits an [Error Boundary](https://reactjs.org/docs/error-boundaries.html).
