import { useContext } from "react";
import { setShowWelcome } from "../../actions";
import { RootContext } from "../../context";
import "./Settings.css"

function Settings() {
  const { dispatch, store } = useContext(RootContext);
  const { showWelcome } = store;

  const triggerWelcomeClick = () => {
    dispatch(setShowWelcome(!showWelcome));
  }

  return (
    <div className="settings panel">
     <ul>
       <li>
         <p>This section is a work-in-progress. What settings would you find useful being customizable? Send your feedback clicking the loudspeaker icon on the sidebar.</p>
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