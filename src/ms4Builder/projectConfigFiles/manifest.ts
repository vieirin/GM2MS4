export const Manifest = (projectName: string) => `Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Bundle-Name: ${projectName}
Bundle-Vendor: My Company
Bundle-Version: 1.0.0
Bundle-SymbolicName: ${projectName}; singleton:=true
Bundle-ActivationPolicy: lazy
Require-Bundle: com.ibm.icu,
 org.eclipse.xtext,
 org.eclipse.xtext.generator,
 org.eclipse.xtend,
 org.eclipse.xtend.typesystem.emf,
 org.eclipse.xpand,
 org.eclipse.xtend.util.stdlib,
 org.eclipse.emf.mwe2.launch;resolution:=optional,
 com.ms4systems.devs.core;visibility:=reexport,
 com.ms4systems.jfreechart;visibility:=reexport,
 com.ms4systems.devs.simviewer.ui;visibility:=reexport,
 org.eclipse.ui;visibility:=reexport,
 org.eclipse.jdt.core;visibility:=reexport,
 org.eclipse.core.runtime;visibility:=reexport,
 com.ms4systems.devs.thirdparty.poi;visibility:=reexport,
 org.eclipse.zest.core;visibility:=reexport,
 org.eclipse.zest.layouts;visibility:=reexport,
 org.eclipse.ui.console;visibility:=reexport,
 org.apache.log4j;visibility:=reexport,
 org.eclipse.text;visibility:=reexport,
 org.eclipse.ui.views;visibility:=reexport,
 com.ms4systems.thirdparty.jsonsimple;visibility:=reexport
Import-Package: org.apache.log4j,
 org.apache.commons.logging
Bundle-RequiredExecutionEnvironment: JavaSE-1.6
`
