package grok_connect.utils;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;

import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;

public class QueryMonitor {
    private List<String> statementIdsToCancel;
    private Multimap<String, Statement> runningStatements;
    private List<String> cancelledStatementIds;

    public QueryMonitor() {
        statementIdsToCancel = Collections.synchronizedList(new ArrayList<>());
        runningStatements = ArrayListMultimap.create();
        cancelledStatementIds = Collections.synchronizedList(new ArrayList<>());
    }

    public boolean addNewStatement(String id, Statement statement) {
        if (id == null)
            return true;
        if (statementIdsToCancel.contains(id)) {
            statementIdsToCancel.remove(id);
            return false;
        }
        runningStatements.put(id, statement);
        return true;
    }

    public void removeStatement(String id) {
        if (id != null)
            runningStatements.removeAll(id);
    }

    public void cancelStatement(String id) {
        if (runningStatements.containsKey(id)) {
            runningStatements.get(id).forEach(s -> {
                try {
                    s.cancel();
                    runningStatements.removeAll(id);
                    cancelledStatementIds.add(id);
                }
                catch (SQLException throwables) {
                    throwables.printStackTrace();
                }
            });
        }
    }

    public boolean checkCancelledId(String id) {
        return cancelledStatementIds.remove(id);
    }
}
