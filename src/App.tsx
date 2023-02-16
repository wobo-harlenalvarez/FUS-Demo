import {
  FileInputButton,
  FileUploadDisplay,
  useFileActions,
  useFileContext,
  useFileSelectHandler,
  useNotification,
  Attachments,
  filterByRef
} from '@workboard/wobo-fus'

import reactLogo from './assets/react.svg'
import './App.css'
import { useMemo, useState } from 'react'

function App() {
  const { handleSelectedFiles, triggerStartProcess } = useFileSelectHandler({referenceType: 'meeting'})
  const { 
    handleSelectedFiles: handleAIFiles,
    triggerStartProcess: triggerAIStartProcess
  } = useFileSelectHandler({referenceType: 'ai'})
  const { uploads } = useFileContext()
  const { uploadActions } = useFileActions()

  const [error, setError] = useState<string>('')
  useNotification((notification) => {
    if(notification.notificationType === 'error') {
      console.error(notification.name, notification.message, notification.error)
      setError(notification.error?.message || notification.message)
    }
  })

  const meetingsFile = useMemo(()=> filterByRef(uploads, { referenceType: 'meeting'}), [uploads])
  const aiFiles = useMemo(() => filterByRef(uploads, {referenceType: 'ai'}), [uploads])
  
  return (
    <div className="App">
      <div>
        <img src="/vite.svg" className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h2>Upload Service</h2>
      <fieldset>
        <legend>Meeting</legend>
        <FileInputButton onFilesSelect={handleSelectedFiles}>Upload File</FileInputButton>
        <FileUploadDisplay referenceType='meeting'/>
        { 
          meetingsFile.length > 0 &&
          <>
            <button onClick={triggerStartProcess}>Start Process</button>
            <button onClick={() => uploadActions.clearUploads(undefined, 'meeting')}>Cancel</button>
          </>
        }
        <Attachments referenceType='meeting' />
      </fieldset>
      <fieldset>
        <legend>AIs</legend>
        <FileInputButton onFilesSelect={handleAIFiles}>Upload AI Files</FileInputButton>
        <FileUploadDisplay referenceType='ai' />
        {
          aiFiles.length > 0 &&
          <>
            <button onClick={triggerAIStartProcess}>Start Process</button>
            <button onClick={() => uploadActions.clearUploads(undefined, 'ai')}>Cancel</button>
          </>
        }
        <Attachments referenceType='ai' />
      </fieldset>
      { error && <h3>{error}</h3>}
    </div>
  )
}

export default App
