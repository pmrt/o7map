import { useCallback, useContext } from 'react';

import { RootDispatch } from '../../context';
import { selectTab, setPanelVisibility } from '../../actions';

import Panel from "../../Panel";
import Console from "./Console";
import Settings from "./Settings";

import { Tools } from '../../constants';

function SettingsPanel({ stdout, activeTab, cmdRef, isVisible }) {
  const dispatch = useContext(RootDispatch);

  const onTabClick = useCallback((title) => {
    dispatch(selectTab(Tools.SETTINGS, title));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCloseClick = useCallback(() => {
    dispatch(setPanelVisibility(Tools.SETTINGS, 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Panel
      defaultPanelKey="console"
      defaultPosition={{x: 20, y: 80}}
      selectedPanelName={activeTab}
      onTabClick={onTabClick}
      onCloseClick={onCloseClick}
      tabTitles={{ "Console": "console", "Settings": "settings" }}
      isVisible={isVisible}
    >
      <Console stdout={stdout} cmdRef={cmdRef} tabKey="console"/>
      <Settings tabKey="settings"/>
    </Panel>
  )
}

export default SettingsPanel;