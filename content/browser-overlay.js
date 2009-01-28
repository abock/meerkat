function delegate (target, callback) {
    return function () { callback.apply (target, arguments); }
}

function Meerkat () {
    this.Initialize ();
}

Meerkat.prototype = {

    progress_listener: null,
    progress_start_ref: 0,
    progress_first_hide: false,
    
    menu_button_filled: false,

    Initialize: function () {
        this.progress_listener = new MeerkatProgressListener (this);
    },

    Dispose: function () {
        if (this.progress_listener) {
            if (this.progress_listener) {
                gBrowser.removeProgressListener (this.progress_listener);
            }

            this.progress_listener.Dispose ();
            this.progress_listener = null;
        }
    },

    OnBrowserLoad: function () {
        window.removeEventListener ("load", this.OnBrowserLoad, true);

        if (this.progress_listener) {
            gBrowser.addProgressListener (this.progress_listener,
                Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
        }
        
        this.HideStatus ();
        this.ConfigureToolbars ();
    },

    OnProgressStart: function () {
        this.ShowStatus ();
    },

    OnProgressStop: function () {
        this.HideStatus ();
    },

    WithStatusBar: function (closure) {
        var status_bar = document.getElementById ("status-bar");
        if (status_bar) {
            delegate (this, closure) (status_bar);
        }

        return false;
    },

    ShowStatus: function () {
        this.progress_start_ref++;
        if (this.progress_start_ref != 1) {
            return;
        }

        this.WithStatusBar (function (bar) bar.collapsed = false);
    },

    HideStatus: function () {
        if (this.progress_start_ref == 0 && this.progress_first_hide) {
            return;
        } else if (this.progress_start_ref > 0) {
            this.progress_start_ref--;
        }

        this.progress_first_hide = true;

        this.WithStatusBar (function (bar) bar.collapsed = true);
    },

    FillMenuButton: function (aParent) {
        if (this.menu_button_filled) {
            return;
        }

        var menu_bar = document.getElementById ("main-menubar");
        
        if (!menu_bar) {
            aParent.style.display = "none";
            return;
        }

        for (var i = 0; i < menu_bar.childNodes.length; i++) {
            aParent.appendChild (menu_bar.childNodes[i].cloneNode (true));
        }
        
        aParent.appendChild (document.createElement ("menuseparator"));
        
        var prefs_item = document.getElementById ("menu_preferences");
        if (prefs_item) {
            aParent.appendChild (prefs_item.cloneNode (true));
        }
        
        var quit_item = document.getElementById ("menu_FileQuitItem");
        if (quit_item) {
            aParent.appendChild (quit_item.cloneNode (true));
        }

        this.menu_button_filled = true;
    },
    
    ConfigureToolbars: function () {
        var add_menu_button = false;
        
        // Only hide the menu bar if it hasn't been customized
        try {
            var menubar = document.getElementById ("toolbar-menubar");
            if (menubar != null && (
                menubar.currentSet == "menubar-items" || // Firefox 3.1 Defaults
                menubar.currentSet == "menubar-items,spring,throbber-box" // Firefox 3.0 Defaults
                )) {
                menubar.collapsed = true;
                add_menu_button = true;
            }
        } catch (e) {
        }
        
        var navbar = document.getElementById ("nav-bar");
        if (navbar) {
            navbar.setAttribute ("iconsize", "small");
            navbar.collapsed = false;
            document.persist (navbar.id, "iconsize");
            
            var items = navbar.currentSet.split (",");
            this.InsertAfterItem (items, "urlbar-container", "downloads-button");
            this.InsertAfterItem (items, "downloads-button", "bookmarks-button");
            if (add_menu_button) {
                var index = items.indexOf ("meerkat-menu-button");
                if (index >= 0) {
                    items.splice (index, 1);
                }
                items.push ("meerkat-menu-button");
            }
            this.UpdateToolbar (navbar, items);
        }
        
        BrowserToolboxCustomizeDone (true);
    },
    
    InsertAfterItem: function (items, before, after) {
        var index = items.indexOf (before);
        if (items.indexOf (after) < 0) {
            if (index < 0) {
                items.push (after);
            } else {
                items.splice (index + 1, 0, after);
            }
        }
    },
    
    UpdateToolbar: function (toolbar, items) {
        if (!toolbar) {
            return;
        }
        
        var items_str = items.join (",");
        
        toolbar.setAttribute ("currentset", items_str);
        toolbar.currentSet = items_str;
        document.persist (toolbar.id, "currentset");
    }
};

var meerkat = new Meerkat;

window.addEventListener ("load", 
    delegate (meerkat, meerkat.OnBrowserLoad), true);

