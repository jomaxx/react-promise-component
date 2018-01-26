# react-promise-component

Sane promise chaining for React!

### Install

```
npm i react-promise-component react --save
```

### Usage

```js
import React from 'react';
import { render } from 'react-dom';
import createPromiseComponent from 'react-promise-component';

const defaultState = {
  value: '',
  results: undefined,
  error: undefined,
  Search: undefined,
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
    const value = e.target.value;

    const Search = createPromiseComponent(value)
      // the promise chain starts executing when the Search component mounts
      .then(value => fetch(`/api/search?q=${value}`))
      .then(r => r.json())
      // if the Search component unmounts before we reach here, then this callback will not execute
      .then(results => this.setState({ results }));

    this.setState({
      ...defaultState,
      value,
      Search,
    });
  }

  render() {
    const {
      value,
      results,
      error,
      Search,
    } = this.state;

    if (error) {
      return <div>An error occurred!</div>;
    }

    return (
      <div>
        <input
          type="text"
          onChange={this.onChange}
          value={value}
        />

        {results && results.map(item => (
          <div key={item.id}>{item.title}</div>
        ))}

        {Search && <Search />}
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
```

### Uncaught errors

Uncaught errors in the promise chain will bubble up the React tree until it hits an [Error Boundary](https://reactjs.org/docs/error-boundaries.html).
