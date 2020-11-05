import { useCallback, useContext } from 'react';

import { RootDispatch } from '../../context';
import { selectTab, setPanelVisibility } from '../../actions';

import Panel from "../../Panel";
import Console from "./Console";
import Settings from "./Settings";

import { Tools } from '../../constants';

function SettingsPanel({ stdout, activeTab }) {
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
      defaultPanel={Console}
      selectedPanelName={activeTab}
      onTabClick={onTabClick}
      onCloseClick={onCloseClick}
      tabTitles={{ "Console": Console, "Settings": Settings }}
    >
      <Console stdout={stdout}/>
      <Settings />
    </Panel>
  )
}

export default SettingsPanel;