import { addStdoutLine } from "../actions";

const helpUrl = "https://gist.github.com/pmrt/8f28e42325a4f4d0b9f2f27156b6152a";

function help(ctx) {
  const { dispatcher } = ctx;
  window.open(helpUrl, "_blank");
  dispatcher(addStdoutLine(`Opening help page, allow pop-up if blocked`, "system"));
}

export default help;