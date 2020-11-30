import { useContext, useState } from "react";
import { setShowWelcome } from "../../actions";
import { RootContext } from "../../context";
import InlineFeedback from "../../InlineFeedback";
import "./Settings.css"

function Settings() {
  const { dispatch, store } = useContext(RootContext);
  const { showWelcome } = store;

  const [status, setStatus] = useState(null);

  const triggerWelcomeClick = () => {
    dispatch(setShowWelcome(!showWelcome));
  }

  const onSendResponse = res => {
    let msg =
    res.code === 200
      ? "Thank you!"
      : "Couldn't send feedback";
    setStatus({ message: msg, code: res.code });
  }

  return (
    <div className="settings panel">
     <ul>
       <li className="feedback-item">
         <p>This section is a work-in-progress.
           What settings would you find useful being customizable?
          <small className={!!status && status.code === 200 ? "success" : ""}>
            {!!status && !!status.message ? status.message : ""}
          </small>
          </p>
         <InlineFeedback
          description=""
          placeholder="I'd like to be able to..."
          type="settings_ideas"
          className="settings-feedback"
          onSendResponse={onSendResponse}
         />
      </li>
     </ul>
      <ul>
        <li>
          <p>Show hints panel</p>
          { !showWelcome
          ? <button onClick={triggerWelcomeClick}>Enable</button>
          : <button onClick={triggerWelcomeClick}>Disable</button>
          }
        </li>
        {/* <li>
          <p>Show system names</p>
          <input type="checkbox" />
        </li>
        <li>
          <p>Show system security</p>
          <input type="checkbox" />
        </li> */}
      </ul>
    </div>
  );
}

export default Settings;