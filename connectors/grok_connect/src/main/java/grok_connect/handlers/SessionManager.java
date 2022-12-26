package grok_connect.handlers;

import java.io.IOException;
import java.util.HashMap;

import org.eclipse.jetty.websocket.api.Session;

import grok_connect.utils.QueryType;

public class SessionManager {
    static HashMap<Session, SessionHandler> sessions = new HashMap<Session, SessionHandler>();

    static void add(Session s, QueryType qt) throws IOException {
        
        sessions.put(s, new SessionHandler(s, qt));
        s.getRemote().sendString("CONNECTED");
    }

    static void onMessage(Session s, String message) throws Throwable {
        sessions.get(s).onMessage(message);
    }

    static void onError(Session s, Throwable error) throws Throwable {
        sessions.get(s).onError(error);
    }

    static void delete(Session s) {
        sessions.remove(s);
    }
}
