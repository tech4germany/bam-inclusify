package de.inclusify;

import org.languagetool.server.HTTPServer;
import org.languagetool.server.HTTPServerConfig;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class MainServlet implements ServletContextListener {

  private HTTPServer languageToolServer;

  @Override
  public void contextInitialized(ServletContextEvent servletContextEvent) {
    HTTPServerConfig options = new HTTPServerConfig(8081, false);
    languageToolServer = new HTTPServer(options, false, null, null);
    languageToolServer.run();
  }

  @Override
  public void contextDestroyed(ServletContextEvent servletContextEvent) {
    if (languageToolServer != null) {
      languageToolServer.stop();
      languageToolServer = null;
    }
  }
}
