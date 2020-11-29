import { useContext, useRef } from "react";
import { RootContext } from "../context";

function InlineFeedback({
  description,
  placeholder,
  type,
  onSendResponse,
  buttonText = "Send",
  className = "inline-feedback",
}) {
  const { cmdRef } = useContext(RootContext);

  const inputRef = useRef(null);

  const onSend = async () => {
    const cmd = cmdRef.current;
    const input = inputRef.current;
    if (!cmd || !input) {
      return null;
    }

    const res = await cmd.exec(["send", "feedback", `"${input.value}"`, type]);
    onSendResponse(res);
  }

  return (
    <div className={className}>
      <p>{description}</p>
      <section>
        <input type="text" ref={inputRef} placeholder={placeholder}></input>
        <button onClick={onSend}>{buttonText}</button>
      </section>
    </div>
  )

}

export default InlineFeedback;