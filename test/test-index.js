/* eslint-disable require-jsdoc */

const test = require('ava');
const cumulusMessageAdapter = require('../index');

test.cb('The correct cumulus message is returned', (t) => {
  const businessLogicOutput = 42;
  const businessLogic = () => businessLogicOutput;

  const inputEvent = { a: 1 };

  const expectedOutput = {
    event: {
      event: inputEvent,
      schemas: null
    },
    handler_response: businessLogicOutput,
    message_config: null,
    schemas: null
  };

  function callback(err, data) {
    t.is(err, null);
    t.deepEqual(data, expectedOutput);
    t.end();
  }

  return cumulusMessageAdapter.runCumulusTask(businessLogic, inputEvent, {}, callback);
});

test.cb('The businessLogic receives the correct arguments', (t) => {
  const inputEvent = { a: 1 };
  const context = { b: 2 };

  const expectedNestedEvent = {
    event: { event: { a: 1 }, schemas: null },
    schemas: null,
    context: { b: 2 }
  };

  function businessLogic(actualNestedEvent, actualContext) {
    t.deepEqual(actualNestedEvent, expectedNestedEvent);
    t.deepEqual(actualContext, context);
  }

  return cumulusMessageAdapter.runCumulusTask(businessLogic, inputEvent, context, t.end);
});

test.cb('A WorkflowError is returned properly', (t) => {
  const inputEvent = { a: 1 };

  const expectedOutput = {
    a: 1,
    payload: null,
    exception: 'SomeWorkflowError'
  };

  function businessLogic() {
    const error = new Error('Oh snap');
    error.name = 'SomeWorkflowError';
    throw error;
  }

  function callback(err, data) {
    t.is(err, null);
    t.deepEqual(data, expectedOutput);
    t.end();
  }

  return cumulusMessageAdapter.runCumulusTask(businessLogic, inputEvent, {}, callback);
});

test.cb('A non-WorkflowError is raised', (t) => {
  function businessLogic() {
    throw new Error('oh snap');
  }

  function callback(err, data) {
    t.is(err.name, 'Error');
    t.is(err.message, 'oh snap');
    t.is(data, undefined);
    t.end();
  }

  return cumulusMessageAdapter.runCumulusTask(businessLogic, {}, {}, callback);
});
