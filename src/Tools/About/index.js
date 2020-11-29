import { useContext } from "react";
import { setPanelVisibility } from "../../actions";
import { Tools } from "../../constants";
import { RootContext } from "../../context";
import Panel from "../../Panel";
import About from "./About";

function AboutPanel({ isVisible }) {
  const { dispatch } = useContext(RootContext);

  const onCloseClick = () => {
    dispatch(setPanelVisibility(Tools.ABOUT, 0));
  }

  return (
    <Panel
      defaultPanelKey="about"
      tabTitles={{ "About": "about"}}
      defaultPosition={{x: 60, y: 200}}
      onCloseClick={onCloseClick}
      customTitlebarClassNames={"titlebar dark-titlebar"}
      customParentClassNames={"panels about-panel"}
      isVisible={isVisible}
    >
      <About tabKey="about"/>
    </Panel>
  )
}

export default AboutPanel;