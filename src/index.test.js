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
    let i = 0;

    const increment = () => {
      console.log('test');
      i = i + 1;
    };

    const Async = createPromiseComponent()
      .then(increment)
      .then(increment)
      .then(increment)
      .then(() => {
        expect(i).toBe(3);
      })
      .finally(done);

    mount(<Async />);
  },
  10,
);

test('rejects promise chain on mount', done => {
  const error = new Error('test');

  let i = 0;

  const increment = () => {
    i = i + 1;
  };

  const Async = createPromiseComponent()
    .then(increment)
    .then(increment)
    .then(() => Promise.reject(error))
    .then(increment)
    .catch(caughtError => {
      expect(i).toBe(2);
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
