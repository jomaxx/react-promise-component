import React from 'react';
import ReactDOM from 'react-dom';
import createPromiseComponent from './index';

const mountNode = document.body.appendChild(document.createElement('div'));
const mount = element => ReactDOM.render(element, mountNode);

afterEach(() => {
  ReactDOM.unmountComponentAtNode(mountNode);
});

test('renders', () => {
  const Async = createPromiseComponent();
  expect(() => mount(<Async />)).not.toThrowError();
});

test('resolves promise on mount', done => {
  const Async = createPromiseComponent(Promise.resolve(1))
    .then(result => {
      expect(result).toBe(1);
    })
    .finally(done);

  mount(<Async />);
});

test('rejects promise on mount', done => {
  const error = new Error('test');

  const Async = createPromiseComponent(Promise.reject(error))
    .then(() => {})
    .catch(caughtError => {
      expect(caughtError).toBe(error);
    })
    .finally(done);

  mount(<Async />);
});

test(
  'resolves promise chain on mount',
  done => {
    const spy = jest.fn();

    const Async = createPromiseComponent()
      .then(spy)
      .then(spy)
      .then(spy)
      .then(() => {
        expect(spy).toHaveBeenCalledTimes(3);
      })
      .finally(done);

    mount(<Async />);
  },
  10,
);

test('rejects promise chain on mount', done => {
  const error = new Error('test');
  const spy = jest.fn();

  const Async = createPromiseComponent()
    .then(spy)
    .then(spy)
    .then(() => Promise.reject(error))
    .then(spy)
    .catch(caughtError => {
      expect(spy).toHaveBeenCalledTimes(2);
      expect(caughtError).toBe(error);
    })
    .finally(done);

  mount(<Async />);
});

test('catches error in error boundary', done => {
  const error = new Error('test');
  const Async = createPromiseComponent(Promise.reject(error));

  class ErrorBoundary extends React.Component {
    componentDidCatch(caughtError) {
      expect(caughtError).toBe(error);
      done();
    }

    render() {
      return this.props.children;
    }
  }

  mount(
    <ErrorBoundary>
      <Async />
    </ErrorBoundary>,
  );
});

test('stops promise chain on unmount', done => {
  const Async = createPromiseComponent().finally(() => {
    done(new Error('error'));
  });

  const Async2 = createPromiseComponent().finally(done);

  mount(<Async />);
  mount(<Async2 />);
});
