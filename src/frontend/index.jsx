import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Button, Heading, TextArea, Label } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {

  const myTest = async () => {
    const resp = await invoke('updateIssues');
  };

  const saveRebaseMessage = async (e) => {
    window.console.log(e);
    let message = e.target.value;
    const response = await invoke('updateRebaseMessage', message);
  };

  const [data, setData] = useState(null);
  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);
  return (
    <>
      <Heading>End of week actions</Heading>
      <Text>Rebase settings</Text>
      <Label labelFor="rebase-message">Rebase message</Label>
      <TextArea id="rebase-message" name="rebase-message-area" appearance="standard" isCompact="true" onBlur={
        async (e) => {
          await saveRebaseMessage(e);
        }
      } value={data}></TextArea>
      <Button onClick={async () => {
        await  myTest();
      }}>Send rebase message</Button>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
