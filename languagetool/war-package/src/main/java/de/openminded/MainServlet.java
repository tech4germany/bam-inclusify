package de.openminded;

import org.languagetool.server.HTTPServer;
import org.languagetool.server.HTTPServerConfig;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpServlet;

@WebListener
public class MainServlet implements ServletContextListener {

  private HTTPServer languageToolServer;

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
