import { useContext  } from "react";
import { setPanelVisibility } from "../../actions";
import { Tools } from "../../constants";
import { RootContext } from "../../context";
import Panel from "../../Panel";
import Feedback from "./Feedback";

function FeedbackPanel({ isVisible }) {
  const { dispatch } = useContext(RootContext);

  const onCloseClick = () => {
    dispatch(setPanelVisibility(Tools.FEEDBACK, 0));
  }

  return (
    <Panel
      defaultPanelKey="feedback"
      tabTitles={{ "Feedback": "feedback"}}
      defaultPosition={{x: 40, y: 100}}
      onCloseClick={onCloseClick}
      customTitlebarClassNames={"titlebar dark-titlebar"}
      customParentClassNames={"panels feedback-panel"}
      isVisible={isVisible}
    >
      <Feedback tabKey="feedback"/>
    </Panel>
  )
}

export default FeedbackPanel;