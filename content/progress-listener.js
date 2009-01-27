const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

function MeerkatProgressListener (meerkatExtension) {
    this.meerkat = meerkatExtension;
}

MeerkatProgressListener.prototype = {

    QueryInterface: function (aIID) {
        var CI = Components.interfaces;

        if (aIID.equals (CI.nsIWebProgressListener) || 
            aIID.equals (CI.nsISupportsWeakReference) || 
            aIID.equals (CI.nsIXULBrowserWindow) || 
            aIID.equals (CI.nsISupports)) {
            return this;
        }
  
        throw Components.results.NS_NOINTERFACE;
    },

    Dispose: function () {
        this.meerkat = null;
    },
    
    onStateChange: function (aProgress, aRequest, aStateFlags, aStatus) {
        if (!this.meerkat) {
            return 0;
        }
        
        if ((aStateFlags & STATE_START) != 0) {
            this.meerkat.OnProgressStart ();
        } else if ((aStateFlags & STATE_STOP) != 0) {
            this.meerkat.OnProgressStop ();
        } 

        return 0;
    },

    onProgressChange: function (aWebProgress, aRequest, aCurSelfProgress, 
        aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
        return 0;
    }, 

    onLocationChange: function (aWebProgress, aRequest, aLocation) {
        return 0;
    },

    onStatusChange: function (aWebProgress, aRequest, aStatus, aMessage) {
        return 0;
    },

    onSecurityChange: function (aWebProgress, aRequest, aState) {
        return 0;
    }
};

