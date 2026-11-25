package com.englishadventure.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle state) {
        registerPlugin(AdventurePlugin.class);
        super.onCreate(state);
    }
}
