import "./Settings.css"

function Settings() {
  return (
    <div className="settings panel">
      <ul>
        <li>
          <p>Show region names</p>
          <input type="checkbox" />
        </li>
        <li>
          <p>Show system names</p>
          <input type="checkbox" />
        </li>
        <li>
          <p>Show system security</p>
          <input type="checkbox" />
        </li>
      </ul>
    </div>
  );
}

export default Settings;