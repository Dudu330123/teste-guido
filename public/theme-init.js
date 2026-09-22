(function () {
  var root = document.documentElement;

  try {
    var saved = window.localStorage.getItem("guido-theme");
    var legacy = window.localStorage.getItem("guido-home-theme");
    var preference = saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : legacy === "light" || legacy === "dark" ? legacy : "system";
    var systemIsDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = preference === "system" ? systemIsDark ? "dark" : "light" : preference;

    root.dataset.themePreference = preference;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute("content", resolved === "dark" ? "#01040c" : "#eaf3fc");
      meta.removeAttribute("media");
    });
  } catch {
    root.dataset.themePreference = "system";
    root.dataset.theme = "light";
    root.style.colorScheme = "light";
  }
})();
