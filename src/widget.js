/* eslint-disable */

function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

export const RedmineHelpdeskWidgetFactory = ({widget_button}) => {
  console.log(widget_button);
  const api = {
    widget: document.getElementById('helpdesk_widget'),
    widget_button,
    loading_div: null,
    full_screen: window.outerWidth <= 500 && window.outerHeight <= 700 ? true : false,
    width: 400,
    height: 500,
    margin: 20,
    button_size: 54,
    iframe: null,
    loaded: false,
    form: null,
    schema: null,
    reload: false,
    configuration: {},
    attachment: null,
    // base_url: 'https://taskman.eionet.europa.eu',
    base_url: '',
    px: function(number){
      return number + 'px';
    },
    config: function(configuration){
      this.configuration = configuration;
      this.apply_config();
    },
    apply_config: function(){
      this.apply_avatar();
      if (this.configuration['color']) {
        this.widget_button.style.backgroundColor = this.configuration['color'];
        this.loading_div.style.borderTop = '8px solid ' + this.configuration['color'];
      }
      if (this.configuration['icon']){
        this.widget_button.innerHTML = this.configuration['icon'];
      }
      switch (this.configuration['position']) {
        case 'topLeft':
          this.widget.style.top = this.px(this.margin);
          this.widget.style.left = this.px(this.margin);
          break;
        case 'topRight':
          this.widget.style.top = this.px(this.margin);
          this.widget.style.right = this.px(this.margin);
          break;
        case 'bottomLeft':
          this.widget.style.bottom = this.px(this.margin);
          this.widget.style.left = this.px(this.margin);
          break;
        case 'bottomRight':
          this.widget.style.bottom = this.px(this.margin);
          this.widget.style.right = this.px(this.margin);
          break;
        default:
          this.widget.style.bottom = this.px(this.margin);
          this.widget.style.right = this.px(this.margin);
      }
    },
    translation: function(field){
      return this.configuration['translation'] && this.configuration['translation'][field] ? this.configuration['translation'][field] : null;
    },
    identify: function(field){
      return this.configuration['identify'] && this.configuration['identify'][field] ? this.configuration['identify'][field] : null
    },
    load: function() {
      this.create_widget_button();
      this.create_loading_div();
      this.decorate_widget_button();
      this.create_iframe();
      this.apply_animation();
      this.widget_button.addEventListener('click', function(){ api.toggle(); console.log('clicked') });
    },
    load_schema: function() {
      this.loading_div.style.display = 'block';
      this.widget_button.style.display = 'none';
      var xmlhttp = getXmlHttp();
      xmlhttp.open('GET', this.base_url + '/helpdesk_widget/load_form.json', true);
      xmlhttp.responseType = 'json';
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200 || xmlhttp.status === 304) {
            api.schema = xmlhttp.response;
            api.fill_form();
            api.loaded = true;
            api.decorate_iframe();
          } else {
            api.schema = {};
            api.loaded = false;
          }
          api.loading_div.style.display = 'none';
          api.widget_button.style.display = 'block';
        }
      };
      xmlhttp.send(null);
    },
    create_widget_button: function(){
      const button = document.createElement('div');
      button.id = 'widget_button';
      button.className = 'widget_button';
      button.innerHTML = '?';
      button.setAttribute('name', 'helpdesk_widget_button');
      button.style.backgroundColor = '#7E8387';
      button.style.backgroundSize = '15px 15px';
      button.style.cursor = 'pointer';
      button.style.color = 'white';
      button.style.textAlign = 'center';
      button.style.fontSize = '32px';
      button.style.verticalAlign = 'middle';
      button.style.lineHeight = this.px(this.button_size);
      button.style.minWidth = this.px(this.button_size);
      button.style.minHeight = this.px(this.button_size);
      button.style.borderRadius = '30px';
      button.style.zIndex = 'inherit';
      button.style.boxShadow = 'rgba(0, 0, 0, 0.258824) 0px 2px 5px 0px';
      button.style.webkitTransition = "transform 0.2s ease";
      this.widget_button = button;
      this.widget.appendChild(button);
    },
    create_loading_div: function(){
      const loading_div = document.createElement('div');
      loading_div.id = 'loading_div';
      loading_div.className = 'loading';
      loading_div.style.minWidth = this.px(this.button_size - 8);
      loading_div.style.minHeight = this.px(this.button_size - 8);
      loading_div.style.position = 'absolute';
      loading_div.style.display = 'none';
      loading_div.style.zIndex = 'inherit';
      this.loading_div = loading_div;
      this.widget.appendChild(loading_div);
    },
    decorate_widget_button: function(){
      const widget = this.widget;
      widget.style.position = 'fixed';
      widget.style.bottom = '20px';
      widget.style.right = '20px';
      widget.style.width = this.px(this.button_size);
      widget.style.height = this.px(this.button_size);
      widget.style.zIndex = 9999;
      widget.style.display = 'flex';
      widget.style.justifyContent = 'end';
      widget.style.alignItems = 'center';
    },
    create_iframe: function(){
      this.iframe = document.createElement('iframe');
      this.iframe.style.opacity = '0';
      this.widget.appendChild(this.iframe);

      this.iframe.onload = function() {
        api.decorate_iframe();
      }
    },
    decorate_iframe: function(){
      this.append_stylesheets();
      const iframe = this.iframe;
      iframe.setAttribute('id', 'helpdesk_ticket_container');
      iframe.setAttribute('frameborder', 0);
      iframe.style.position = 'absolute';
      iframe.style.opacity = '0';
      iframe.style.minWidth = this.full_screen ? '100vw' : this.px(this.width);
      iframe.style.minHeight = this.full_screen ? '100vh': this.px(this.height);
      iframe.style.maxWidth = 'initial';
      iframe.style.backgroundColor = 'white';
      iframe.style.top = 0;
      iframe.style.webkitTransition = "top 0.5s, opacity 0.1s";
      iframe.style.transition = "top 0.5s, opacity 0.1s";
      iframe.style.boxShadow = 'rgba(0, 0, 0, 0.258824) 0px 1px 4px 0px';
      iframe.setAttribute('name', 'helpdesk_widget_iframe');
    },
    appendToIframe: function(element){
      this.iframe.contentWindow.document.body.appendChild(element)
    },
    fill_form: function(){
      if (Object.keys(this.schema.projects).length > 0) {
        this.create_form();
        this.create_form_close_button();
        this.create_form_title();
        this.create_error_flash();

        if (this.identify('redmineUserID')) {
          this.create_form_hidden(this.form, 'redmine_user', 'redmine_user', 'form-control', this.identify('redmineUserID'));
        }
        if (this.identify('nameValue')) {
          this.create_form_hidden(this.form, 'username', 'username', 'form-control', this.identify('nameValue'));
        } else {
          this.create_form_text(this.form, 'username', 'username', this.translation('nameLabel') || 'Your name', 'form-control', this.identify('nameValue'), true);
        }
        if (this.identify('emailValue')) {
          this.create_form_hidden(this.form, 'email', 'email', 'form-control', this.identify('emailValue'));
        } else {
          this.create_form_text(this.form, 'email', 'email' , this.translation('emailLabel') || 'Email address', 'form-control', this.identify('emailValue'), true);
        }
        if (this.identify('subjectValue')) {
          this.create_form_hidden(this.form, 'subject', 'issue[subject]', 'form-control', this.identify('subjectValue'));
        } else {
          this.create_form_text(this.form, 'subject', 'issue[subject]' , this.translation('subjectLabel') || 'Subject', 'form-control', this.identify('subjectValue'), true);
        }
        if (this.identify('issueCategory')) {
          this.create_form_hidden(this.form, 'issue_category', 'issue_category', 'form-control', this.identify('issueCategory'));
        }
        this.create_projects_selector();
        this.create_form_area(this.form, 'description', 'issue[description]' , this.translation('descriptionLabel') || 'Ticket description', 'form-control', true);

        var project_id = null;
        var tracker_id = null;
        if (api.configuration['identify']){
          project_id = api.schema.projects[api.configuration['identify']['projectValue']];
          if (project_id) {
            tracker_id = api.schema.projects_data[project_id].trackers[api.configuration['identify']['trackerValue']];
          }
        }

        this.load_project_data(project_id || this.schema.projects[Object.keys(this.schema.projects)[0]], tracker_id);
        setTimeout(() => api.appendToIframe(api.form), 1);
        this.append_scripts();
        this.create_message_listener();
      } else {
        this.widget.style.opacity = 0;
      }
    },
    apply_avatar: function(){
      const button = document.getElementById('widget_button');
      const avatar = api.configuration['user_avatar'];
      if (avatar && avatar.length > 0) {
        var xmlhttp = getXmlHttp();
        xmlhttp.open('GET', api.base_url + '/helpdesk_widget/avatar/' + avatar, true);
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200 || xmlhttp.status === 304) {
              button.style.backgroundSize = 'cover';
              button.style.backgroundImage = 'url(' + api.base_url + '/helpdesk_widget/avatar/' + avatar + ')' ;
              button.style.border = '2px solid';
              button.innerHTML = '&nbsp;';
            } else {
              button.style.backgroundSize = '15px 15px';
              button.innerHTML = '?';
            }
            button.style.display = 'block';
            button.style.lineHeight = '50px';
          }
        };
        xmlhttp.send(null);
      } else {
        button.style.lineHeight = '54px';
        button.style.backgroundSize = '15px 15px';
        button.innerHTML = '?';
        button.style.display = 'block';
      }
    },
    apply_animation: function(){
      const animation_css = document.createElement('link');
      animation_css.href = this.base_url + '/helpdesk_widget/animation.css';
      animation_css.rel = "stylesheet";
      animation_css.type = "text/css";

      document.head.appendChild(animation_css);
    },
    append_stylesheets: function(){
      const widget_css = document.createElement('link');
      widget_css.href = this.base_url + '/helpdesk_widget/widget.css';
      widget_css.rel = "stylesheet";
      widget_css.type = "text/css";
      this.iframe.contentWindow.document.head.appendChild(widget_css);
      if (this.configuration['styles']) {
        const styles_css = document.createElement('style');
        styles_css.innerHTML = this.configuration['styles'];
        styles_css.type = "text/css";
        this.iframe.contentWindow.document.head.appendChild(styles_css);
      }
    },
    append_scripts: function(){
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.base_url + '/helpdesk_widget/iframe.js';
      console.log('script element', script, this.iframe);
      this.iframe.contentWindow.document.head.appendChild(script);

      const config_script = document.createElement('script');
      config_script.innerHTML = "var RedmineHelpdeskIframe = {configuration: "+ JSON.stringify(this.configuration) +"}";
      this.iframe.contentWindow.document.head.appendChild(config_script);
    },
    create_form: function(){
      this.form = document.createElement('form');
      this.form.action = this.base_url + '/helpdesk_widget/create_ticket';
      this.form.acceptCharset = 'UTF-8';
      this.form.method = 'post';
      this.form.id = 'widget_form';
      this.form.setAttribute('onSubmit', 'submitTicketForm(); return false;');
      this.form.style.marginBottom = 0;
    },
    create_form_close_button: function(){
      const close_button = document.createElement('div');
      close_button.className = 'close-button';
      close_button.style.position = 'absolute';
      close_button.style.top = 0;
      close_button.style.right = 0;
      close_button.style.width = '40px';
      close_button.style.height = '40px';
      close_button.style.background = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj4KICA8cGF0aCBmaWxsPSIjMkUzQjRFIiBkPSJNMTEuNDE0LDEwbDYuMjkzLTYuMjkzYzAuMzkxLTAuMzkxLDAuMzkxLTEuMDIzLDAtMS40MTRzLTEuMDIzLTAuMzkxLTEuNDE0LDBMMTAsOC41ODZMMy43MDcsMi4yOTMgYy0wLjM5MS0wLjM5MS0xLjAyMy0wLjM5MS0xLjQxNCwwcy0wLjM5MSwxLjAyMywwLDEuNDE0TDguNTg2LDEwbC02LjI5Myw2LjI5M2MtMC4zOTEsMC4zOTEtMC4zOTEsMS4wMjMsMCwxLjQxNCBzMS4wMjMsMC4zOTEsMS40MTQsMEwxMCwxMS40MTRsNi4yOTMsNi4yOTNjMC4zOTEsMC4zOTEsMS4wMjMsMC4zOTEsMS40MTQsMHMwLjM5MS0xLjAyMywwLTEuNDE0TDExLjQxNCwxMHoiIC8+Cjwvc3ZnPgo=") center center no-repeat';
      close_button.setAttribute('onClick', 'closeTicketForm(); return false;');

      this.form.appendChild(close_button);
    },
    create_form_title: function(){
      if (this.configuration['title']) {
        const title_div = document.createElement('div');
        title_div.id = 'title';
        title_div.className = 'title';
        title_div.innerHTML = this.configuration['title'];
        this.form.appendChild(title_div);
      }
    },
    create_error_flash: function(){
      const flash_div = document.createElement('div');
      flash_div.id = 'flash';
      flash_div.className = 'flash';
      flash_div.style.marginTop = '20px';
      this.form.appendChild(flash_div);
    },
    create_projects_selector: function(){
      var project_id = null;
      if (api.configuration['identify']){
        project_id = api.schema.projects[api.configuration['identify']['projectValue']];
      }
      if (project_id) {
        this.create_form_hidden(this.form, 'project_id', 'project_id', 'form-control projects', project_id);
      } else {
        this.create_form_select(this.form, 'project_id', 'project_id', api.schema.projects, project_id, 'form-control projects');
      }
    },
    load_project_data: function(project_id, tracker_id){
      let container_div = this.form.getElementsByClassName('container')[0]
      if (container_div) { container_div.remove() };

      container_div = document.createElement('div');
      container_div.id = 'container';
      container_div.className = 'container';

      const custom_div = document.createElement('div');
      custom_div.id = 'custom_fields';
      custom_div.className = 'custom_fields';

      const submit_div = document.createElement('div');
      submit_div.id = 'submit_button';
      submit_div.className = 'submit_button';

      container_div.appendChild(custom_div);

      this.create_form_privacy_policy(container_div);

      container_div.appendChild(submit_div);

      if (api.configuration['identify'] && api.schema.projects_data[project_id].trackers[api.configuration['identify']['trackerValue']]){
        tracker_id = api.schema.projects_data[project_id].trackers[api.configuration['identify']['trackerValue']]
        this.create_form_hidden(custom_div, 'tracker_id', 'tracker_id', 'form-control trackers', tracker_id);
      } else {
        this.create_form_select(custom_div, 'tracker_id', 'tracker_id', this.schema.projects_data[project_id].trackers, tracker_id, 'form-control trackers');
        tracker_id = custom_div.getElementsByClassName('trackers')[0].value;
      }
      this.load_custom_fields(custom_div, project_id, tracker_id);

      this.create_form_submit(submit_div, this.translation('createButtonLabel') || 'Create ticket');
      this.create_attch_link(submit_div);

      this.form.appendChild(container_div);
    },
    reload_project_data: function(){
      let container_div = this.form.getElementsByClassName('container')[0]
      const project_id = this.form.getElementsByClassName('projects')[0].value;
      const tracker_id = container_div.getElementsByClassName('trackers')[0].value;

      this.load_project_data(project_id, tracker_id);
      this.arrange_iframe();
    },
    create_form_select: function(target, field_id, field_name, values, selected, field_class){
      let field;

      if (Object.keys(values).length === 1) {
        field = document.createElement('input');
        field.type = 'hidden';
        field.id  = field_id;
        field.name  = field_name;
        field.className = field_class;
        field.value = values[Object.keys(values)[0]];
      } else {
        field = document.createElement('select');
        field.id = field_id;
        field.name = field_name;
        field.className = field_class;
        for (var project in values) {
          const option = document.createElement('option');
          option.value = values[project]
          if(values[project] === selected) { option.selected  = 'selected'; }
          option.innerHTML = project;
          field.appendChild(option);
        }
      }
      field.setAttribute('onChange', 'needReloadProjectData();');
      target.appendChild(field);
    },
    create_form_hidden: function(target, field_id, field_name, field_class, value){
      const field = document.createElement('input');
      field.type = 'hidden';
      field.id  = field_id;
      field.name  = field_name;
      field.value  = value;
      field.className = field_class;
      target.appendChild(field);
    },
    create_form_text: function(target, field_id, field_name, field_placeholder, field_class, value, required){
      const field = document.createElement('input');
      field.type = 'text';
      field.id  = field_id;
      field.name  = field_name;
      field.value  = value;
      field.placeholder = field_placeholder;
      field.className = required ? field_class + ' required-field' : field_class;
      target.appendChild(field);
    },
    create_form_area: function(target, field_id, field_name, field_placeholder, field_class, required){
      const field = document.createElement('textarea');
      field.cols = 55;
      field.rows = 10;
      field.id  = field_id;
      field.name  = field_name;
      field.placeholder = field_placeholder;
      field.className = required ? field_class + ' required-field' : field_class;
      target.appendChild(field);
    },
    create_form_submit: function(target, label){
      const field = document.createElement('input');
      field.id  = 'form-submit-btn';
      field.type = 'submit';
      field.name = 'submit';
      field.className = 'btn';
      field.value = label;
      field.title = this.translation('buttomLabel') || '';
      if (api.configuration['color']) {
        field.style.background = api.configuration['color'];
      }
      target.appendChild(field);
    },
    create_form_privacy_policy: function (target) {
      var privacy_policy_div = document.createElement('div');
      privacy_policy_div.id = 'privacy_policy_fields';
      privacy_policy_div.className = 'privacy_policy_fields';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'privacy_policy';
      checkbox.name = 'privacy_policy';
      checkbox.value = 1;
      checkbox.required = 'required';

      var checkbox_label = document.createElement('label');
      checkbox_label.htmlFor = checkbox.id;
      // slice(3, -4) for removing wrapper <p>...</p>
      checkbox_label.innerHTML = `<p>I read and agree with the <a href="https://www.eea.europa.eu/legal/privacy/contact-us-privacy-statement" class="external">privacy statement</a></p>`.slice(3, -4);

      var links = checkbox_label.getElementsByTagName('a');
      for (var i = 0, len = links.length; i < len; i++) { links[i].target = '_blank' }

      privacy_policy_div.appendChild(checkbox);
      privacy_policy_div.appendChild(checkbox_label);
      target.appendChild(privacy_policy_div);
    },
    create_attch_link: function(target){
      if (this.configuration['attachment'] !== false ) {
        const attach_div = document.createElement('div');
        attach_div.className = 'attach_div';

        const attach_link = document.createElement('a');
        attach_link.className = 'attach_link';
        attach_link.href = 'javascript:void(0)';
        attach_link.innerHTML = this.translation('attachmentLinkLabel') || 'Attach a file';
        attach_div.appendChild(attach_link);

        const attach_field = document.createElement('input');
        attach_field.type = 'file';
        attach_field.id = 'attachment';
        attach_field.className = 'attach_field';
        attach_field.name = 'attachment';
        attach_field.attributes['data-max-size'] = 104857600;
        attach_field.addEventListener('change', function(){ api.upload_file() });
        attach_div.appendChild(attach_field);
        this.attachment = attach_field;

        target.appendChild(attach_div);
      }
    },
    upload_file: function(){
      if (this.attachment.attributes['data-max-size'] > this.attachment.files[0].size) {
        this.read_file(this.attachment.files[0], function(e){
          const attach_field = api.form.getElementsByClassName('attach_field')[0]
          attach_field.attributes['data-value'] = e.target.result;
          const displayed_name = (attach_field.files[0].name.length <= 20) ? attach_field.files[0].name : attach_field.files[0].name.substring(0, 20) + '...';
          api.form.getElementsByClassName('attach_link')[0].innerHTML = displayed_name;
        });
      }  else {
        this.attachment.attributes['data-value'] = '';
        api.form.getElementsByClassName('attach_link')[0].innerHTML = 'Sorry, too large';
      }
    },
    read_file: function(file, callback){
      var reader = new FileReader();
      reader.onload = callback
      reader.readAsDataURL(file);
    },
    load_custom_fields: function(target, project_id, tracker_id){
      var xmlhttp = getXmlHttp();
      var params = 'project_id=' + encodeURIComponent(project_id) + '&tracker_id=' + encodeURIComponent(tracker_id);
      const custom_div = document.createElement('div');
      xmlhttp.open('GET', this.base_url + '/helpdesk_widget/load_custom_fields?' + params, true);
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200 || xmlhttp.status === 304) {
            custom_div.innerHTML = xmlhttp.responseText;
            target.appendChild(custom_div);
            api.set_custom_values();
            setTimeout(function(){ api.arrange_iframe() }, 100);
          }
        }
      };
      xmlhttp.send(null);
    },
    set_custom_values: function(){
      if (this.configuration['identify'] && this.configuration['identify']['customFieldValues']){
        for(var cf in this.configuration['identify']['customFieldValues']) {
          const custom_field = this.form.querySelector('#issue_custom_field_values_' + this.schema.custom_fields[cf])
          if (custom_field){
            switch (custom_field.tagName){
              case 'INPUT':
                custom_field.type = 'hidden';
                custom_field.value = this.configuration['identify']['customFieldValues'][cf];
                this.form.querySelector("[data-error-key='" + cf + "']").style.display = 'none';
                break;
              case 'SELECT':
                const options = custom_field.options;

                for(var option, index = 0; option = options[index]; index++) {
                  if(option.value === this.configuration['identify']['customFieldValues'][cf]) {
                    this.create_form_hidden(custom_field.parentElement, custom_field.id, custom_field.name, custom_field.classList.toString(), this.configuration['identify']['customFieldValues'][cf]);
                    custom_field.remove();
                    this.form.querySelector("[data-error-key='" + cf + "']").style.display = 'none';
                    break;
                  }
                }
                break;
              default:
                break
            }
          }
        }
      }
    },
    arrange_iframe: function(){
      const button_margin = this.margin + this.button_size;

      if (!this.full_screen){
        this.iframe.style.minHeight = this.px(this.form.offsetHeight + this.margin);
      } else {
        this.iframe.style.paddingTop = this.px(button_margin + (button_margin / 3));
      }

      switch (this.configuration['position']) {
        case 'topLeft':
          this.iframe.style.top = this.full_screen ? this.px(-this.margin) : this.px(button_margin);
          this.iframe.style.left = this.full_screen ? this.px(-this.margin) : this.px(0);
          break;
        case 'topRight':
          this.iframe.style.top = this.full_screen ? this.px(-this.margin) : this.px(button_margin);
          this.iframe.style.left = this.full_screen ? this.px(-window.innerWidth + button_margin) : this.px(- this.width + this.button_size);
          break;
        case 'bottomLeft':
          this.iframe.style.top = this.full_screen ? this.px(- window.innerHeight + button_margin) : this.px(- this.form.offsetHeight - this.margin * 2);
          this.iframe.style.left = this.full_screen ? this.px(-this.margin) : this.px(0);
          break;
        case 'bottomRight':
          this.iframe.style.top = this.full_screen ? this.px(- window.innerHeight + button_margin) : this.px(-this.form.offsetHeight - this.margin * 2);
          this.iframe.style.left = this.full_screen ? this.px(-window.innerWidth + button_margin) : this.px(-this.width + this.button_size);
          break;
        default:
          this.iframe.style.top = this.full_screen ? this.px(- window.innerHeight + button_margin) : this.px(-this.form.offsetHeight - this.margin * 2);
          this.iframe.style.left = this.full_screen ? this.px(-window.innerWidth + button_margin) : this.px(-this.width + this.button_size);
      }
      this.iframe.style.opacity = '1';
    },
    create_message_listener: function(){
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

      eventer(messageEvent,function(e) {
        const data = JSON.parse(e.data);
        if (data['reload'] === true)         { api.reload = true; }
        if (data['project_reload'] === true) { api.reload_project_data(); }
        if (data['arrange'] === true)        { api.arrange_iframe(); }
        if (data['close'] === true)          { api.toggle(); }
      }, false);
    },
    reload_form: function(){
      this.iframe.remove();
      this.create_iframe();
      this.fill_form();
      this.decorate_iframe();
      this.reload = false;
    },
    show: function() {
      if (this.loaded) this.arrange_iframe();
      switch (this.configuration['position']) {
        case 'topLeft':
        case 'topRight':
          this.widget_button.style.borderRadius = '50% 50% 0%';
          break;
        case 'bottomLeft':
        case 'bottomRight':
          this.widget_button.style.borderRadius = '0 100% 100%';
          break;
        default:
          this.widget_button.style.borderRadius = '0 100% 100%';
      }

      this.widget_button.style.webkitTransform = 'rotate(45deg)';
      this.widget_button.style.mozTransform = 'rotate(45deg)';
      this.widget_button.style.msTransform = 'rotate(45deg)';
      this.widget_button.style.oTransform = 'rotate(45deg)';
    },
    hide: function() {
      if (this.reload === true) {
        this.reload_form();
      }
      // const body = this.iframe.contentWindow.document.body;
      this.iframe.style.opacity = 0;
      this.iframe.style.top = 0;
      this.widget_button.style.borderRadius = '30px';
      this.widget_button.style.webkitTransform = '';
      this.widget_button.style.mozTransform = '';
      this.widget_button.style.msTransform = '';
      this.widget_button.style.oTransform = '';
    },
    toggle: function() {
      if (!this.loaded) this.load_schema();
      (this.iframe.style.opacity === 1) ? this.hide() : this.show();
    }
  }

  return api;
};
