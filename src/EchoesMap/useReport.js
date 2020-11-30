import { useCallback, useContext, useEffect, useRef } from "react"
import { addStdoutLine, setIsReceivingReports } from "../actions";
import { REPORTS } from "../constants";
import { RootContext } from "../context";

function useReport(regionId, wait) {
  const { dispatch, forceReportUpdateRef, mapRef } = useContext(RootContext);

  const log = useCallback((str, lvl="info") => {
    dispatch(addStdoutLine(str, lvl));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setIsReceiving = useCallback((isReceiving) => {
    dispatch(setIsReceivingReports(isReceiving));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let timeoutRef = useRef(null), errCount = 0;
  useEffect(() => {
    let didCancel = false;
    async function fetchReport() {
      let url =
        regionId
          ? REPORTS + "?regionId=" + regionId
          : REPORTS;

      return await fetch(url);
    }

    async function renderReports() {
      clearTimeout(timeoutRef.current);
      let resp, reports;
      log(":: Fetching reports..");
      try {
        resp = await fetchReport();
      } catch (err) {
        console.log(err);
        if (++errCount > 10) {
          log("ERR: Cancelling reports subscription due to >3 errors", "error");
          return;
        }
        timeoutRef.current = setTimeout(renderReports, wait);
        log(`ERR: Error when fetching report. Retry scheduled: T+${wait/1000}s`, "error");
        setIsReceiving(false);
        return;
      }

      if (resp.status && resp.status === 204) {
        timeoutRef.current = setTimeout(renderReports, wait);
        mapRef.current.clearReports();
        log(`No reports found. Next update scheduled: T+${wait/1000}s`);
        setIsReceiving(true);
        return;
      }

      if (resp.status && resp.status === 404) {
        mapRef.current.clearReports();
        log(`ERR: Failed to fetch reports: 404 Not Found`, "error");
        setIsReceiving(false);
        return;
      }

      try {
        reports = await resp.json();
      } catch (err) {
        log("ERR: While parsing report response", "error");
        return;
      }

      if (!didCancel && mapRef.current) {
        mapRef.current.drawReports(reports);
        timeoutRef.current = setTimeout(renderReports, wait);
        log(`Reports updated. Next update scheduled: T+${wait/1000}s`);
        setIsReceiving(true);
      }
    }

    if (!mapRef.current) {
      console.error("Using reports when map is not ready/available");
      return;
    }

    forceReportUpdateRef.current = renderReports;
    if (!mapRef.current.isRendered()) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(renderReports, 1500);
    } else {
      renderReports();
    }

    return () => {
      clearTimeout(timeoutRef.current);
      didCancel = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, wait]);
}

export default useReport;