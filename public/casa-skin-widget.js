/**
 * Casa Kilicé — licensed embed widget. Add after registering allowed origins in admin.
 * <script src="https://YOUR_DOMAIN/casa-skin-widget.js" data-site-key="ckw_..." async></script>
 */
(function (w, d) {
  var sc = d.currentScript;
  if (!sc || !sc.getAttribute) return;
  var site = sc.getAttribute("data-site-key");
  if (!site) return;
  var base = (function () {
    try {
      return new URL(sc.src).origin;
    } catch (e) {
      return "";
    }
  })();
  if (!base) return;
  var label = sc.getAttribute("data-label") || "Casa Kilicé AI";

  function openModal(embedUrl) {
    var overlay = d.createElement("div");
    overlay.setAttribute(
      "style",
      "position:fixed;inset:0;z-index:2147483640;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box",
    );
    var panel = d.createElement("div");
    panel.setAttribute(
      "style",
      "position:relative;width:min(480px,100%);max-height:92vh;background:#faf8f4;border-radius:14px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.28);box-sizing:border-box",
    );
    var x = d.createElement("button");
    x.type = "button";
    x.setAttribute("aria-label", "Close");
    x.textContent = "\u00d7";
    x.setAttribute(
      "style",
      "position:absolute;right:6px;top:4px;z-index:2;border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#3b2f2f",
    );
    var iframe = d.createElement("iframe");
    iframe.setAttribute("src", embedUrl);
    iframe.setAttribute("title", "Casa Kilicé Skin");
    iframe.setAttribute(
      "style",
      "width:100%;min-height:440px;border:0;display:block;background:#faf8f4",
    );
    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    x.onclick = close;
    overlay.onclick = function (ev) {
      if (ev.target === overlay) close();
    };
    panel.appendChild(x);
    panel.appendChild(iframe);
    overlay.appendChild(panel);
    d.body.appendChild(overlay);
  }

  function onClick() {
    fetch(base + "/api/v1/widget/verify?k=" + encodeURIComponent(site), { credentials: "omit", mode: "cors" })
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        if (j && j.ok && j.embedUrl) openModal(j.embedUrl);
        else if (w.console && console.warn) console.warn("[Casa Kilicé]", (j && j.error) || "Widget not licensed.");
      })
      .catch(function () {});
  }

  var btn = d.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.setAttribute(
    "style",
    "margin:8px 0;padding:10px 20px;border-radius:999px;border:1px solid rgba(59,47,47,.18);background:#2a2420;color:#f4efe6;font:600 12px system-ui,-apple-system,sans-serif;cursor:pointer",
  );
  btn.onclick = onClick;
  sc.parentNode.insertBefore(btn, sc.nextSibling);
})(window, document);
