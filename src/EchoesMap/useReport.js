import { useEffect, useRef } from "react"
import { REPORTS } from "../constants";

function useReport(regionId, logger, setIsReceiving, mapRef, forceUpdateRef, wait) {
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
      logger(":: Fetching reports..");
      try {
        resp = await fetchReport();
      } catch (err) {
        console.log(err);
        if (++errCount > 3) {
          logger("ERR: Cancelling reports subscription due to >3 errors", "error");
          return;
        }
        timeoutRef.current = setTimeout(renderReports, wait);
        logger(`ERR: Error when fetching report. Retry scheduled: T+${wait/1000}s`, "error");
        setIsReceiving(false);
        return;
      }

      if (resp.status && resp.status === 204) {
        timeoutRef.current = setTimeout(renderReports, wait);
        mapRef.current.clearReports();
        logger(`No reports found. Next update scheduled: T+${wait/1000}s`);
        setIsReceiving(true);
        return;
      }

      if (resp.status && resp.status === 404) {
        mapRef.current.clearReports();
        logger(`ERR: Failed to fetch reports: 404 Not Found`, "error");
        setIsReceiving(false);
        return;
      }

      try {
        reports = await resp.json();
      } catch (err) {
        logger("ERR: While parsing report response", "error");
        return;
      }

      if (!didCancel && mapRef.current) {
        mapRef.current.drawReports(reports);
        timeoutRef.current = setTimeout(renderReports, wait);
        forceUpdateRef.current = renderReports;
        logger(`Reports updated. Next update scheduled: T+${wait/1000}s`);
        setIsReceiving(true);
      }
    }

    if (!mapRef.current) {
      console.error("Using reports when map is not ready/available");
      return;
    }

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