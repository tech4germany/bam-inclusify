package de.openminded;

import org.languagetool.server.HTTPServer;
import org.languagetool.server.HTTPServerConfig;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

@WebListener
public class MainServlet extends HttpServlet implements ServletContextListener {
  private HTTPServer languageToolServer;
  public MainServlet() {
  }

  @Override
  public void destroy() {
    System.out.println("MainServlet.destroy");
//    if (languageToolServer != null) {
//      languageToolServer.stop();
//      languageToolServer = null;
//    }
  }

  @Override
  public void init() {
    System.out.println("MainServlet.init");
//    HTTPServerConfig options = new HTTPServerConfig(8081, false);
//    languageToolServer = new HTTPServer(options, false, null, null);
//    languageToolServer.run();
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse response) throws IOException {
    // Ausgabe als Text-Datei
    response.setContentType("text/plain;charset=UTF-8");

    // Ausgabe durchführen
    PrintWriter out = response.getWriter();
    out.println("Hallo Welt!");
    out.println();
    out.println("Aktuelles Datum und Uhrzeit: " + (new Date()).toString());
    out.close();

  }

  @Override
  public void contextInitialized(ServletContextEvent servletContextEvent) {
    System.out.println("MainServlet.contextInitialized");
    HTTPServerConfig options = new HTTPServerConfig(8081, false);
    languageToolServer = new HTTPServer(options, false, null, null);
    languageToolServer.run();
  }

  @Override
  public void contextDestroyed(ServletContextEvent servletContextEvent) {
    System.out.println("MainServlet.contextDestroyed");
    if (languageToolServer != null) {
      languageToolServer.stop();
      languageToolServer = null;
    }
  }
}
