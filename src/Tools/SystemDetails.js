import { useContext, useEffect, useState } from 'react';
import Select from 'react-select';

import { addStdoutLine, setPanelVisibility } from '../actions';
import { REPORT, Reports, STATIONS, Tools } from '../constants';
import { RootContext, UserContext } from '../context';

import Panel from '../Panel';

import "./SystemDetails.css";

import dcLogo from "../img/dc_logo_white.png";

const delay = (fn, wait) => setTimeout(fn, wait);

const selectorTheme = {
  borderRadius: 0,
  colors: {
    /*
    * multiValue(remove)/color:hover
    */
    danger: "#DE350B",
    /*
    * multiValue(remove)/backgroundColor(focused)
    * multiValue(remove)/backgroundColor:hover
    */
    dangerLight: "#FFBDAD",
    /*
    * control/backgroundColor
    * menu/backgroundColor
    * option/color(selected)
    */
    neutral0: "var(--theme-primary)",
    /*
    * control/borderColor
    * option/color(disabled)
    * indicators/color
    * indicators(separator)/backgroundColor
    * indicators(loading)/color
    */
    neutral20: "var(--theme-grey)",
    /*
    * control/borderColor(focused)
    * control/borderColor:hover
    */
    neutra30: "red",
    /*
    * placeholder/color
    */
    neutral50: 'var(--theme-grey)',
    /*
    * input/color
    * multiValue(label)/color
     * singleValue/color
    * indicators/color(focused)
    * indicators/color:hover(focused)
    */
    neutral80: "var(--theme-primary)",
    /*
    * control/boxShadow(focused)
    * control/borderColor(focused)
    * control/borderColor:hover(focused)
    * option/backgroundColor(selected)
    * option/backgroundColor:active(selected)
    */
    primary: "var(--theme-grey-2)",
    /*
    * option/backgroundColor(focused)
    */
    primary25: "var(--theme-background-secondary)",
    primary75: "yellow",
    /*
    * option/backgroundColor:active
    */
    primary50: "--theme-purpled-blue",
  }
}

const selectorStyles = {
  container: (provided) => ({
    ...provided,
    zIndex: "2",
    fontSize: "11px",
  }),
  control: (provided) => ({
    ...provided,
    border: "none",
    background: "var(--theme-background-grey)",
    padding: "0 2px",
  }),
  singleValue: (provided) => ({
    ...provided,
    width: "100%",
    textAlign: "center",
  }),
  placeholder: (provided) => ({
    ...provided,
    fontStyle: "italic",
  }),
  menu: (provided) => ({
    ...provided,
    background: "var(--theme-background)",
  })
}

function useSystemOptions({
  systemId,
  edges,
  dispatch,
  mapRef,
  stations: nStations,
}) {
  const [ sysOpts, setSysOpts ] = useState([]);

  useEffect(() => {
    let didCancel = false;

    async function buildOpts(systemId) {
      let resp, opts = [];
      setSysOpts([]);

      if (nStations > 0) {
        try {
          const stations = await fetch(STATIONS+ "?systemId="+systemId);
          resp = await stations.json();
        } catch(err) {
          dispatch(addStdoutLine(`ERR: Couldn't fetch stations for '${systemId}'`, "error"));
          setSysOpts([]);
          return;
        }
      }

      if (!resp) {
        resp = []
      }

      if (resp && resp.code === 204) {
        // no stations found for system
        resp = []
      }


      const sysObjs = [
        ...edges,
        ...resp,
      ];

      try {
        for (let obj of sysObjs) {
          const value = obj.id || obj.dst;

          let label = "Station: " + obj.name;
          if (obj.dst) {
            const map = mapRef.current;
            const systemAtEdge = await map.getSystemById(obj.dst);
            label = "Gate: " + systemAtEdge.name;
          }

          opts.push({ value, label });
        }
      } catch(err) {
        if (!didCancel) {
          dispatch(addStdoutLine(`ERR: Couldn't fetch edges for '${systemId}'`, "error"));
          setSysOpts([]);
        }
        return;
      }

      if (!didCancel) {
        setSysOpts(opts);
      }
    }

    buildOpts(systemId);

    return () => {
      didCancel = true;
    }
    // - Dispatch is stable
    // - map is meant to be stable during the whole app
    // - edges depends on systemId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemId]);

  return sysOpts;
}

async function sendReport(systemId, objId, reportType) {
  const reqData = {
    sid: systemId,
    oid: objId,
    t: reportType,
  }

  let resp;
  try {
    resp = await fetch(REPORT, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqData),
    });
  } catch (err) {
    throw err;
  }
  return resp;
}

const initialInfo = { msg: "Select an object before sending a report", type: "info" };
const initialNotLoggedInInfo = { msg: "Login before sending actions", type: "info" };
const initialActions = {
  info: initialInfo,
  selectedOpt: null,
}
const initialNotLoggedInActions = {
  info: initialNotLoggedInInfo,
  selectedOpt: null,
}

const ActionButton = ({ loggedIn, onClick, disabled, children }) => {
  if (!loggedIn) {
    return (
      <a
      className="login-btn"
      href="/auth/discord"
      >
        <img
        alt="Discord logo"
        src={dcLogo}
        ></img>
        Log in with Discord
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
    >{children}</button>
  )
}

function SystemDetails() {
  const { store, dispatch, mapRef, forceReportUpdateRef } = useContext(RootContext);
  const { userInfo } = useContext(UserContext);
  const { isDevMode, details } = store;
  const { system } = details;

  const {
    ID,
    rawName,
    sec,
    coords,
    constellation,
    region,
    edges,
    stations,
    planets,
  } = system;

  const [ actions, setActions ] = useState(initialActions)
  const { info, selectedOpt } = actions;

  useEffect(() => {
    // Reset selection when system ID changes
    let newActions =
      !!userInfo
        ? initialActions
        : initialNotLoggedInActions;
    setActions(newActions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ID])

  const sysOpts = useSystemOptions({
    systemId: ID,
    dispatch,
    mapRef,
    edges,
    stations
  })

  const onSystemObjectSelect = opt => {
    setActions({
      selectedOpt: opt,
      info: { msg: "Click on an action", type: "info" },
    })
  }

  const sendCampReport = async () => {
    if (!selectedOpt) {
      return
    }

    let resp;
    try {
      resp = await sendReport(ID, selectedOpt.value, Reports.CAMP);
    } catch(err) {
      dispatch(addStdoutLine([
        "ERR: " + err,
        "Report couldn't be sent"
      ], "error"));
      setActions({
        ...actions,
        info: { msg: "Report couldn't be sent", type: "error" },
      })
      return;
    }

    if (!resp) {
      dispatch(addStdoutLine([
        "ERR: empty response",
        "Report couldn't be sent"
      ], "error"));
      setActions({
        ...actions,
        info: { msg: "Report couldn't be sent", type: "error" },
      })
      return;
    }

    try {
      resp = await resp.json();
    } catch(err) {
      dispatch(addStdoutLine([
        "ERR: " + err,
        "Report couldn't be sent"
      ], "error"));
      setActions({
        ...actions,
        info: { msg: "Report couldn't be sent", type: "error" },
      })
      return;
    }

    switch (resp.code) {
      case 200:
        setActions({
          ...actions,
          info: { msg: resp.message, type: "success" },
        })

        if (forceReportUpdateRef.current) {
          delay(() => forceReportUpdateRef.current(), 2e3);
        }
        return
      case 429:
        dispatch(addStdoutLine([
          "ERR: " + resp.message,
          "Report couldn't be sent"
        ], "error"));
        setActions({
          ...actions,
          info: { msg: resp.message, type: "error" },
        })
        return
      case 401:
        dispatch(addStdoutLine([
          "ERR: " + resp.message,
          "Report couldn't be sent"
        ], "error"));
        setActions({
          ...actions,
          info: { msg: resp.message, type: "error" },
        })
        return
      default:
        dispatch(addStdoutLine([
          "ERR: " + JSON.stringify(resp),
          "Report couldn't be sent"
        ], "error"));
        setActions({
          ...actions,
          info: { msg: "Report couldn't be sent", type: "error" },
        })
    }
  }

  return (
    <div className="system-details">
      <div className="system-details-title">
        <h3>System :: {rawName}</h3>
      </div>
      <div className="system-info-fields">
        <div className="system-info">
          { !!isDevMode && <div className="system-info-field">
            <label htmlFor="sys-id">ID</label>
            <p name="sys-id">{ID}</p>
          </div>}
          <div className="system-info-field">
            <label htmlFor="sys-sec">Security Level</label>
            <p>{sec.str}</p>
          </div>
          { !!isDevMode && <div className="system-info-field">
            <label htmlFor="sys-coords">Coordinates</label>
            <p name="sys-coords">x: {coords.x}; y: {coords.y}</p>
          </div>}
          <div className="system-info-field">
            <label htmlFor="sys-cn">Constellation</label>
            <p htmlFor="sys-cn">{constellation.name}</p>
          </div>
          <div className="system-info-field">
            <label htmlFor="sys-rg">Region</label>
            <p name="sys-rg">{region.name}</p>
          </div>
          <div className="system-info-field">
            <label htmlFor="sys-edges">Gates</label>
            <p name="sys-edges">{!!edges ? edges.length : 0}</p>
          </div>
          <div className="system-info-field">
            <label htmlFor="sys-stations">Stations</label>
            <p name="sys-stations">{stations}</p>
          </div>
          <div className="system-info-field">
            <label htmlFor="sys-planets">Planets</label>
            <p name="sys-planets">{planets}</p>
          </div>
        </div>

        <div className="system-actions">
          <div className="system-buttons-wrapper">
            <h1>Actions</h1>
            <div className="system-action-select">
              <Select
                name="system-action"
                placeholder="Object in system to report..."
                value={selectedOpt}
                onChange={onSystemObjectSelect}
                styles={selectorStyles}
                theme={selectorTheme}
                options={sysOpts}


              />
            </div>
            <div className="system-buttons">
              <ActionButton
                onClick={sendCampReport}
                disabled={!selectedOpt}
                loggedIn={!!userInfo}
              >Report camp</ActionButton>
              <div className={`system-info-message ${info.type}`}>
                <p>{info.msg}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemDetailsPanel({ isVisible }) {
  const { store, dispatch, mapRef } = useContext(RootContext);
  const { details } = store;
  const { system } = details;

  if (!system) {
    return null;
  }

  if (!mapRef.current) {
    return null;
  }

  const onCloseClick = () => {
    dispatch(setPanelVisibility(Tools.SYSTEM_DETAILS, 0));
  }

  return (
   <Panel
    defaultPanelKey="system-details"
    defaultPosition={{x: 160, y: 105}}
    tabTitles={{ "System Details": "system-details"}}
    onCloseClick={onCloseClick}
    customParentClassNames={"panels system-details-panel"}
    isVisible={isVisible}
  >
    <SystemDetails
      tabKey="system-details"
    />
  </Panel>
  )
}

export default SystemDetailsPanel;