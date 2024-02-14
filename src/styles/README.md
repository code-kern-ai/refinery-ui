# Style guide for refinery-ui
For every page that we need an additional styling, we create a new module css file (ex. page.module.css).
The style contains only classes that can be imported in the corresponding page. For example the styling in the project-list page is imported in the following way: `import style from "@/src/styles/components/projects/projects-list.module.css"` (absolute paths works too).

The classes in the file should be declared using the camel case rule. In order to use a specific class from the module, we can access it by using `style.nameOfTHeClass`.
Example how to use the class 'scrollableSize' from the 'project-list.module.css':  `<div className={style.scrollableSize}></div>`

Note: We can only do this for classes, not for IDs or other attributes.
