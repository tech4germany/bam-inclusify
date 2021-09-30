/* LanguageTool, a natural language style checker 
 * Copyright (C) 2013 Daniel Naber (http://www.danielnaber.de)
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301
 * USA
 */
package org.languagetool.language;

import org.jetbrains.annotations.Nullable;
import org.languagetool.GlobalConfig;
import org.languagetool.Language;
import org.languagetool.UserConfig;
import org.languagetool.JLanguageTool;
import org.languagetool.languagemodel.LanguageModel;
import org.languagetool.rules.Rule;
import org.languagetool.rules.de.LongSentenceRule;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.ResourceBundle;

public class LanguageName extends GermanyGerman {

  @Override
  public boolean isVariant() {
    return true;
  }

  @Override
  public String getName() {
    return "Language Name";
  }

  @Override
  public String getShortCode() {
    return "de-DE-x-language-code";  // a "private use tag" according to http://tools.ietf.org/html/bcp47
  }

  @Override
  public Contributor[] getMaintainers() {
    return new Contributor[] {
        new Contributor("Tech4Germany")
    };
  }

  @Override
  public List<String> getRuleFileNames() {
    List<String> ruleFileNames = new ArrayList<>();
    String dirBase = JLanguageTool.getDataBroker().getRulesDir() + "/" + getShortCode() + "/";
    ruleFileNames.add(dirBase + "grammar.xml");
    return ruleFileNames;
  }

}
