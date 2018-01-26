import React from 'react';

function _createPromiseComponent(promise, chain = []) {
  class PromiseComponent extends React.Component {
    componentWillMount() {
      this.setState({
        error: undefined,
      });
    }

    componentDidMount() {
      let mounted = true;

      chain
        .reduce(
          (prev, [resolve, reject]) =>
            prev.then(
              resolve && (resolved => mounted && resolve(resolved)),
              reject && (rejected => mounted && reject(rejected)),
            ),
          promise,
        )
        .catch(error => mounted && this.setState({ error }));

      this.componentWillUnmount = () => {
        mounted = false;
      };
    }

    componentWillUpdate(nextProps, nextState) {
      if (nextState.error && nextState.error !== this.props.error) {
        throw nextState.error;
      }
    }

    render() {
      return null;
    }
  }

  PromiseComponent.then = (resolve, reject) =>
    _createPromiseComponent(promise, chain.concat([[resolve, reject]]));

  PromiseComponent.catch = reject =>
    _createPromiseComponent(promise, chain.concat([[null, reject]]));

  PromiseComponent.finally = fn =>
    _createPromiseComponent(promise, chain.concat([[() => fn(), () => fn()]]));

  return PromiseComponent;
}

function createPromiseComponent(promise) {
  return _createPromiseComponent(Promise.resolve(promise));
}

export default createPromiseComponent;
