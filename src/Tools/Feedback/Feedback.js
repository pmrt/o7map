import { useCallback, useContext, useRef, useState } from "react";
import { RootContext } from "../../context";
import "./Feedback.css"

function Feedback() {
  const { cmdRef } = useContext(RootContext);
  const [ canSendLogs, setCanSendLogs] = useState(false);
  const [ status, setStatus ] = useState(null);

  const textareaRef = useRef(null);

  const onCheckboxChange = () => setCanSendLogs(!canSendLogs);

  const onSendLogsClick = useCallback(async () => {
    const cmd = cmdRef.current;
    const textarea = textareaRef.current;
    if (!cmd || !textarea) {
      return null;
    }

    const res = await cmd.exec(["send", "feedback", `"${textarea.value}"`, "feedback_tool"]);
    if (canSendLogs) {
      // we don't care about the result
      cmd.exec(["send", "debug"]);
    }
    setStatus(res);
  }, [canSendLogs, cmdRef])

  return (
    <div className="feedback">
      <p>Any feedback is welcome. For reaching out to the app developer please send an email to <strong>o7@pedro.to</strong>.
        Only english or spanish.
      </p>
      <p className="error-info">For errors, please check the 'Send logs with errors' box. Tip: you can see
        your logs in the <strong>'Settings' wheel button on the sidebar &gt; Console</strong> section.
        That's exactly what you will be sending and nothing more.
      </p>
      <div className="send-feedback">
        <textarea
          placeholder="Suggestions, error reports, appreciations, ideas... any feedback is welcome!"
          maxLength="1000"
          ref={textareaRef}
        ></textarea>
        <div className="send-feedback-actions">
          <p className={!!status && status.code === 200 ? "success" : ""}>
            {!!status && !!status.message ? status.message : ""}
          </p>
          <div className="send-feedback-buttons">
            <button onClick={onSendLogsClick}>Send</button>
            <input
            name="send-logs"
            type="checkbox"
            onChange={onCheckboxChange}
            defaultChecked={canSendLogs}></input>
            <label htmlFor="send-logs">Send logs with errors</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feedback;