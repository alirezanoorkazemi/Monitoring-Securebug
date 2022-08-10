emailTemplateLayout = function (header, content) {
    return `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title>
    </title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
      #outlook a { padding:0; }
      .ReadMsgBody { width:100%; }
      .ExternalClass { width:100%; }
      .ExternalClass * { line-height:100%; }
      body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
      table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
      img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
      p { display:block;margin:13px 0; }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width:480px) {
        @-ms-viewport { width:320px; }
        @viewport { width:320px; }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]>
    <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <!--[if lte mso 11]>
    <style type="text/css">
      .outlook-group-fix { width:100% !important; }
      .outlook-group-fix-small { width:12% !important; }
    </style>
    <![endif]-->
    
  <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
@import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
    </style>
  <!--<![endif]-->
<style type="text/css">
  @media only screen and (min-width:480px) {
    .mj-column-per-60 { width:60% !important; max-width: 60%; }
.mj-column-per-40 { width:40% !important; max-width: 40%; }
.mj-column-per-100 { width:100% !important; max-width: 100%; }
.mj-column-per-50 { width:50% !important; max-width: 50%; }
.mj-column-per-25 { width:25% !important; max-width: 25%; }
.mj-column-per-20 { width:12% !important; max-width: 12%; }
  }
</style>
    <style type="text/css">    
@media only screen and (max-width:480px) {
  table.full-width-mobile { width: 100% !important; }
  td.full-width-mobile { width: auto !important; }
}
    </style>
    <style type="text/css">.hide_on_mobile { display: none !important;} 
    @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
    .hide_section_on_mobile { display: none !important;} 
    @media only screen and (min-width: 480px) { .hide_section_on_mobile { display: table !important;} }
    .hide_on_desktop { display: block !important;} 
    @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
    .hide_section_on_desktop { display: table !important;} 
    @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
    [owa] .mj-column-per-100 {
        width: 100%!important;
      }
      [owa] .mj-column-per-50 {
        width: 50%!important;
      }
      [owa] .mj-column-per-33 {
        width: 33.333333333333336%!important;
      }
      [owa] .mj-column-per-15 {
        width:12% !important;
      }
      p {
          margin: 0px;
      }
      @media only print and (min-width:480px) {
        .mj-column-per-100 { width:100%!important; }
        .mj-column-per-40 { width:40%!important; }
        .mj-column-per-60 { width:60%!important; }
        .mj-column-per-50 { width: 50%!important; }
        mj-column-per-33 { width: 33.333333333333336%!important; }
        .mj-column-per-15 { width:12% !important;}
        }</style>
      <style type="text/css">
@media (prefers-color-scheme: dark ) {
        /* Custom Dark Mode Background Color */
.darkmode { background-color: #282828 }

/* Custom Dark Mode Font Colors */
h1, h2, p, span, a, b { color: #fcf5eb !important; }
body { background-color: #282828 !important; }
div{ color: #fcf5eb !important; }
}
        </style>
  </head>
  <body style="background-color:#333333;background-image: linear-gradient(#333333,#333333)" bgcolor="#333333">
  <div align="center">
      <table border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tbody>
          <tr>
              <td valign="top" style="background:#333333;padding:0cm 0cm 6.0pt 0cm">
                  <div style="background-color:#282828;" bgcolor="#282828" class="darkmode">
${header}
${content}

                      <!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;" 
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" bgcolor="#282828" class="darkmode">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                              <tbody>
                              <tr>
                                  <td style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;">
                                      <!--[if mso | IE]>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                  <td
                                     class="" style="vertical-align:top;max-width:600px;"
                                  >
                                <![endif]-->
                                      <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">

                                                      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                          <p><span style="font-size: 16px;color: #bbbbbb !important;">This message has been generated based on your filters and notifications settings. Please, do not respond to it.</span></p>
                                                      </div>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                      <!--[if mso | IE]>
                                        </td>
                                    </tr>
                                              </table>
                                            <![endif]-->
                                  </td>
                              </tr>
                              </tbody>
                          </table>
                      </div>
                      <!--[if mso | IE]>
                                                    </td>
                                                  </tr>
                                                </table>

                                                <table
                                                   align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                                                >
                                                  <tr>
                                                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" bgcolor="#282828" class="darkmode">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                              <tbody>
                              <tr>
                                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                      <!--[if mso | IE]>
                                        </td>
                                        <td
                                           class="" style="vertical-align:top;width:75px;"
                                        >
                                      <![endif]-->
                                      <div style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:12.5%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">

                                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                          <tbody>
                                                          <tr>
                                                              <td style="width:75px;">
                                                                  <a href="https://www.youtube.com/channel/UCiBKtlU6Tp3QxY-TFOgGNvw" style="outline:none" tabindex="-1" target="_blank"> <img align="center" alt="youtube" border="0" class="center autowidth" src="https://securebug.se/wp-content/uploads/2021/12/IMG_20211215_112411_440.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 75px; display: block;" title="youtube" width="75"/></a>
                                                              </td>
                                                          </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                      <!--[if mso | IE]>
                                        </td>
                                        <td
                                           class="" style="vertical-align:top;width:75px;"
                                        >
                                      <![endif]-->
                                      <div style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:12.5%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                          <tbody>
                                                          <tr>
                                                              <td style="width:75px;">
                                                                  <a href="https://www.instagram.com/securebug/?igshid=1v9lp2b1wny5q" style="outline:none" tabindex="-1" target="_blank"> <img align="center" alt="Instagram" border="0" class="center autowidth" src="https://securebug.se/wp-content/uploads/2020/10/insta-oout-01.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 75px; display: block;" title="Instagram" width="75"/></a>
                                                              </td>
                                                          </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                      <!--[if mso | IE]>
                                        </td>
                                        <td
                                           class="" style="vertical-align:top;width:75px;"
                                        >
                                      <![endif]-->
                                      <div style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:12.5%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                          <tbody>
                                                          <tr>
                                                              <td style="width:75px;">
                                                                  <a href="https://www.linkedin.com/company/securebugab" style="outline:none" tabindex="-1" target="_blank"> <img align="center" alt="LinkedIn" border="0" class="center autowidth" src="https://securebug.se/wp-content/uploads/2020/10/linkdin-out-01.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 75px; display: block;" title="LinkedIn" width="75"/></a>
                                                              </td>
                                                          </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                      <!--[if mso | IE]>
                                        </td>
                                        <td
                                           class="" style="vertical-align:top;width:75px;"
                                        >
                                      <![endif]-->
                                      <div style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:12.5%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">

                                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                          <tbody>
                                                          <tr>
                                                              <td style="width:75px;">
                                                                  <a href="https://twitter.com/securebug_ab" style="outline:none" tabindex="-1" target="_blank"> <img align="center" alt="Twitter" border="0" class="center autowidth" src="https://securebug.se/wp-content/uploads/2020/10/twitter-out-01.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 75px; display: block;" title="Twitter" width="75"/></a>
                                                              </td>
                                                          </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                      <!--[if mso | IE]>
                                        </td>
                                    </tr>
                                              </table>
                                            <![endif]-->
                                  </td>
                              </tr>
                              </tbody>
                          </table>
                      </div>
                      <!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                              <tbody>
                              <tr>
                                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                      <!--[if mso | IE]>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                  <td
                                     class="" style="vertical-align:top;max-width:600px;"
                                  >
                                <![endif]-->
                                      <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                          <p style="text-align: center;color: #bbbbbb !important;">&copy; SecureBug AB ,SE-Org.nr: 559201-3030<br>SecureBug AB is a Swedish <span style="font-size: 12px;">limited</span> company with its registered office<br>in Sweden, 411 36 ,Kungsportsavenyen 21</p>
                                                      </div>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>

                                      <!--[if mso | IE]>
                                        </td>
                                    </tr>

                                              </table>
                                            <![endif]-->
                                  </td>
                              </tr>
                              </tbody>
                          </table>
                      </div>
                      <!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <![endif]-->
                  </div>
              </td>
          </tr>
          </tbody>
      </table>
  </div>
  </body>
</html>`
};

emailTemplateHeader = function (first_name) {
    return `<!--[if mso | IE]>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
             <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;width:360px;"
                                >
                              <![endif]-->
                                    <!--[if mso | IE]>
                                      </td>
                                      <td
                                         class="" style="vertical-align:top;width:240px;"
                                      >
                                    <![endif]-->

                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:120px;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">

                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                        <tbody>
                                                        <tr>
                                                            <td style="width:80px;">

                                                                <img height="auto" src="https://securebug.se/wp-content/uploads/2020/09/Untitled-10-01-01.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="80" alt="SecureBug Logo">

                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>

                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">

                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                        <tbody>
                                                        <tr>
                                                            <td style="width:120px;">

                                                                <img height="auto" src="https://securebug.se/wp-content/uploads/2020/09/Logo-SecureBug-14.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="120" alt="SecureBug Logo Text">
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>

                                                </td>
                                            </tr>

                                        </table>

                                    </div>

                                    <!--[if mso | IE]>
                                      </td>

                                  </tr>
                                            </table>
                                          <![endif]-->
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                    <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">

                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;width:240px;"
                                >
                              <![endif]-->

                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:0;word-break:break-word;">
                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                        <tbody>
                                                        <tr>
                                                            <td style="width:50px;padding-left: 14px;">

                                                                <img height="auto" src="https://securebug.se/wp-content/uploads/2020/09/icon-registering-01.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="55" alt="Register Icon">

                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 0 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Hi <span class="user-name">${first_name},</span></span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateSign = function (is_hacker) {
    return `<tr>
    <td align="left" style="font-size:0;padding:15px 15px 15px 15px;word-break:break-word;">
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
         ${is_hacker ? "<div><span style='font-size: 16px;'>Happy Hunting!</span></div>" : ""}
            <div><span style="font-size: 16px;">SecureBug Support Team</span></div>
        </div>
    </td>
</tr>`
};

emailTemplateRegister = function (url, sign) {
    return ` <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 0 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Thank you for registering as a hunter on our Platform.
</span><br><span style="font-size: 16px;">Before you log in, please verify your email address.
</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fe5000;">
                                                        <a href="#" style="color: #fcf5eb;font-size: 16px;">
                                                            <strong style="color: #fcf5eb; font-weight: normal;">support@securebug.se</strong>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <!--[if mso | IE]>
                                                                  </td>
                                                                </tr>
                                                              </table>

                                                              <table
                                                                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                                                              >
                                                                <tr>
                                                                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                              <![endif]-->

                                    <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" class="darkmode">
                                            <tbody>
                                            <tr>
                                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                                    <!--[if mso | IE]>
                                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td
                                                   class="" style="vertical-align:top;width:300px;"
                                                >
                                              <![endif]-->
                                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                            <tr>
                                                                <td align="left" style="font-size:0px;padding:15px;word-break:break-word;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td style="width:100%;">
                                                                                <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                                    <span style="color: #fe5000;font-size: 14px;font-weight: bold;border-radius: 12px;  border: 1px solid #fe5000;padding: 15px 8px; font-family:Ubuntu, Helvetica, Arial, sans-serif;">Click here to Verify your Email Address</span>
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                   ${sign}

                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateInvitationHacker = function (program_name, expire_date, invitations_url, sign) {
    return `<!--[if mso | IE]>
                       </td>
                     </tr>
                   </table>

                   <table
                      align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                   >
                     <tr>
                       <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                   <![endif]-->
                   <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                        <tbody>
                        <tr>
                            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                <!--[if mso | IE]>
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>

                            <td
                               class="" style="vertical-align:top;max-width:600px;"
                            >
                          <![endif]-->

                                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Dear Hunter,</span><br><span style="font-size: 16px;">We are glad to inform you that you have been invited to hunt on ${program_name} private program.</span></p>
                                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Remember that your invitation will expire on ${expire_date} 
                                                    </span></p>
                                                    <div style="margin: 32px 0;">
                                                      <a href="${invitations_url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                          <span style="color: #fe5000;font-size: 14px;font-weight: bold;border-radius: 12px;  border: 1px solid #fe5000;padding: 15px 8px; font-family:Ubuntu, Helvetica, Arial, sans-serif;">view invitation</span>
                                                      </a>
                                                    </div>
                                                    <p><span style="font-size: 16px;">In case you can't see the 'view invitation' button above, <a href="${invitations_url}" style="text-decoration: none;"><span style="color: #fe5000;">click here.</span></a></span></p>
                                                    <p style="margin-top: 16px;"><span style="font-size: 16px;color: #fcf5eb !important;">As ${program_name} is a private program, please refrain from discussing it in public.
                                                  </span></p>
                                                  <p><span style="font-size: 16px;">For any changes to your invitation preferences, please  <a href="${invitations_url}" style="text-decoration: none;"><span style="color: #fe5000;">click here.</span></a></span></p>
                                                  <p style="margin-top: 16px;"><span style="font-size: 16px;color: #fcf5eb !important;">Don't hesitate to contact our support team at <span style="color: #fe5000;">support@securebug.se</span> in case you have any questions or doubts. 
                                                  </span></p>
                                              </div>
                                            </td>
                                        </tr>
                                ${sign}
                                    </table>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>`
};

emailTemplateSupport = function (subject, message, email) {
    return `<!--[if mso | IE]>
                      </td>
                    </tr>
                  </table>
                  <table
                     align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                  >
                    <tr>
                      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                  <![endif]-->
                  <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                        <tbody>
                        <tr>
                            <td style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;">
                                <!--[if mso | IE]>
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td
                               class="" style="vertical-align:top;max-width:600px;"
                            >
                          <![endif]-->
                                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Email : ${email},</span></p>
                                                    </span></p>
                                              </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <!--[if mso | IE]>
                                                              </td>
                                                            </tr>
                                                          </table>

                                                          <table
                                                             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                                                          >
                                                            <tr>
                                                              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                          <![endif]-->
                                <!--[if mso | IE]>
                                  </td>
                              </tr>
                                        </table>
                                      <![endif]-->
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <!--[if mso | IE]>
                    </td>
                  </tr>
                </table>
                <table
                   align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;" 
                >
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
                <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" bgcolor="#282828" class="darkmode">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                        <tbody>
                        <tr>
                            <td style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;">
                                <!--[if mso | IE]>
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td
                               class="" style="vertical-align:top;max-width:600px;"
                            >
                          <![endif]-->
                                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                      <tr>
                                            <td align="left" style="font-size:0px;padding:0 15px 0 15px;word-break:break-word;">
                                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Subject : ${subject}</span></p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Message : ${message}</span></p>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>`
};

emailTemplateForgotPassword = function (url, url2, sign) {
    return `<!--[if mso | IE]>
                            </td>
                          </tr>
                        </table>
                        <table
                           align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                        >
                          <tr>
                            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                        <![endif]-->
                        <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                              <tbody>
                              <tr>
                                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                      <!--[if mso | IE]>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              <tr>
  
                                  <td
                                     class="" style="vertical-align:top;max-width:600px;"
                                  >
                                <![endif]-->
                                      <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                              <tr>
                                                  <td align="left" style="font-size:0px;padding:15px 15px 0 15px;word-break:break-word;">
  
                                                      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                          <p><span style="font-size: 16px;">We received a request to reset your password.</span><br><span style="font-size: 16px;">If you would like to reset your password, please click the button below.</span></p>
                                                      </div>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
  
                                                      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fe5000;">
                                                          <a href="#" style="color: #fe5000;font-size: 16px;">
                                                              <strong style="color: #fe5000; font-weight: normal;">support@securebug.se</strong>
                                                          </a>
                                                      </div>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                      <!--[if mso | IE]>
                                                                    </td>
                                                                  </tr>
                                                                </table>
  
                                                                <table
                                                                   align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                                                                >
                                                                  <tr>
                                                                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                                <![endif]-->
                                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" class="darkmode">
                                              <tbody>
                                              <tr>
                                                  <td style="direction:ltr;font-size:0px;padding:15px;text-align:center;vertical-align:top;">
                                                      <!--[if mso | IE]>
                                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                              <tr>
                                                  <td
                                                     class="" style="vertical-align:top;width:300px;"
                                                  >
                                                <![endif]-->
                                                      <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                              <tr>
                                                                  <td align="left" style="font-size:0px;padding: 0px;word-break:break-word;">
  
                                                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                                          <tbody>
                                                                          <tr>
                                                                              <td style="width:100%;">
                                                                                  <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                                      <span style="color: #fe5000;font-size: 14px;font-weight: bold;border-radius: 12px;  border: 1px solid #fe5000;padding: 15px 8px; font-family:Ubuntu, Helvetica, Arial, sans-serif;">Click here To Change Your Password</span>
                                                                                  </a>
                                                                              </td>
                                                                          </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </div>
                                                      <div class="mj-column-per-50 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                      </div>
                                                  </td>
                                              </tr>
                                        ${sign}
                                              </tbody>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                              </tbody>
                          </table>
                      </div>`
};

emailTemplateVerify = function (url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;">Welcome to our Hunters Team, before starting,  you have to complete your profile on the platform.</span></p>
                                                        <br/>
                                                        <p>
                                                          <span style="font-size: 16px;">And you can gain SBcoins by verifying yourself and uploading your Resume and Certificates.</span></p>
                                                        </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fe5000;">
                                                        <a href="#" style="color: #fe5000;font-size: 16px;">
                                                            <strong style="color: #fe5000; font-weight: normal;">support@securebug.se</strong>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <!--[if mso | IE]>
                                                                  </td>
                                                                </tr>
                                                              </table>

                                                              <table
                                                                 align="left" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;" width="600"
                                                              >
                                                                <tr>
                                                                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                              <![endif]-->

                                    <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" class="darkmode">
                                            <tbody>
                                            <tr>
                                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;vertical-align:top;">
                                                    <!--[if mso | IE]>
                                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td
                                                   class="" style="vertical-align:top;width:300px;"
                                                >
                                              <![endif]-->
                                                    <div class="mj-column-per-50 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                            <tr>
                                                                <td align="left" style="font-size:0px;padding:15px;word-break:break-word;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td style="width:100%;">
                                                                                <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                                    <span style="color: #fe5000;font-size: 14px;font-weight: bold;border-radius: 12px;  border: 1px solid #fe5000;padding: 15px 8px; font-family:Ubuntu, Helvetica, Arial, sans-serif;">Click here to Visite SecureBug</span>
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            ${sign}
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateForSalesPartsAfterVerificationCompany = function (email, role, organizationName, phone, country) {
    return `<!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>

                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">

                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">

                            <tr>

                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->

                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">

                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">

                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Email : ${email},</span></p>
                                                        </span></p>
                                                  </div>

                                                </td>
                                            </tr>

                                        </table>

                                    </div>
                                    <!--[if mso | IE]>
                                                                  </td>
                                                                </tr>
                                                              </table>

                                                              <table
                                                                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                                                              >
                                                                <tr>
                                                                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                              <![endif]-->

                                    <!--[if mso | IE]>
                                      </td>

                                  </tr>

                                            </table>
                                          <![endif]-->
                                </td>
                            </tr>
                            </tbody>
                        </table>

                    </div>
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;" 
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                    <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:0 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->

                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">

                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">

                                          <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Role : ${role}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Organization Name : ${organizationName}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Phone : ${phone}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Country : ${country}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`;
}

emailTemplateVerifyIdentifyHacker = function (sign) {
    return `<!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 0 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;">On behalf of all of us, welcome on board, and Thank you for choosing SecureBug.</span></p>
                                                       <br/>
                                                        <p><span style="font-size: 16px;">Your Identity has been verified and You’re almost ready to start enjoying it. You receive 50 SB coins in your account. Please check your Leaderboard and take a look at our Gamification.</span></p>
                                                        <br/>
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Thanks in advance and Happy Hunting 
                                                        </span></p>
                                                        <div style="margin: 32px 0;">
                                                          <a href="https://securebug.se/wp-content/uploads/2021/01/Gamification-Methodology-1.pdf" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                              <span style="color: #fe5000;font-size: 14px;font-weight: bold;border-radius: 12px;  border: 1px solid #fe5000;padding: 15px 8px; font-family:Ubuntu, Helvetica, Arial, sans-serif;">Download Gamification document</span>
                                                          </a>
                                                        </div>
                                                        <p><span style="font-size: 16px;">In case you can't see the 'Download Gamification document' button above, <a href="https://securebug.se/wp-content/uploads/2021/01/Gamification-Methodology-1.pdf" style="text-decoration: none;"><span style="color: #fe5000;">click here.</span></a></span></p>
                                                  </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            ${sign}
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateRejectIdentifyHacker = function (sign) {
    return `<!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>

                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;">Please attach another picture of your Attachments Be clear, easily seen and read, and no parts of the document are cut off.</span></p>
                                                  </div>

                                                </td>
                                            </tr>
                                        ${sign}
                                        </table>
                                    </div>
                                    </div>`
};

emailTemplateAfterCompanyVerifyByAdmin = function (sign) {
    return `<!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>

                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                    <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:0 0px 0 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px  15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                                        </span></p>
                                                        <p><span style="font-size: 16px;">We would like to thank you for the registration and welcome you to Nordic’s Novel CrowdSourced Security Platform!</span></a></span></p>
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                                          SecureBug  </span></p>
                                                  </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:0 15px 0 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;">You can log in at <a href="https://app.securebug.se/company/login" style="color:#ff5b10;text-decoration: none;">https://app.securebug.se/company/login</a></span></a></span></p>
                                                  </div>
                                                </td>
                                            </tr>
                                            <tr>
                                              <td align="left" style="font-size:0px;padding:15px 15px 0 15px;word-break:break-word;">
                                                  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                      <p><span style="font-size: 16px;">Want to know about our platform and how it works click <a href="https://www.youtube.com/watch?v=TbR-C4PPl00" target="_blank" style="color:#ff5b10;text-decoration: none;">here</a></span></a>.</span></p>
                                                </div>
                                              </td>
                                          </tr>
                                            <tr>
                                              <td align="left" style="font-size:0px;padding:0 15px 0 15px;word-break:break-word;">
<div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
  <p><span style="font-size: 16px;">You have a verified access now with full capabilities. If you need more capabilities, you can contact through the site or email to - </span><span style="color:#ff5b10;font-size:16px">support@securebug.se</span></p>
</div>
</td>
                                            </tr>
                                          ${sign}
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateCompanyInviteMemberForMember = function (company_name, role, url, sign) {
    return `<!--[if mso | IE]>
                            </td>
                          </tr>
                        </table>
                        <table
                           align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                        >
                          <tr>
                            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                        <![endif]-->
                        <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                                <tbody>
                                <tr>
                                    <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                        <!--[if mso | IE]>
                                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td
                                       class="" style="vertical-align:top;max-width:600px;"
                                    >
                                  <![endif]-->
                                        <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                <tr>
                                                    <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                            <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                                            </span></p>
                                                            <p><span style="font-size: 16px;">You have been invited, as a team member with the ${role} role, to the following company.</span></a></span></p>
                                                         <br/>
                                                            <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                                                Company Name: ${company_name}  </span></p>
                                                      </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                            <p><span style="font-size: 16px;">Once you accept the invitation and become a team member, you'll be able to view programs created by team leaders as well as submitted reports in your Securebug account. Please click this <a href="${url}" style="color:#ff5b10;text-decoration: none;">link</a> to join.</span></span></p>
                                                      </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
      <p><span style="font-size: 16px;">Thank you for using Securebug!  </span></p>
  </div>
  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
      <p><span style="font-size: 16px;">Have a great day ahead,</span></p>
  </div>
  </td>
                                                </tr>
                                                ${sign}
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>`
};

emailTemplateSubmitReportHacker = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
      <tbody>
      <tr>
          <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
          <td
             class="" style="vertical-align:top;max-width:600px;"
          >
        <![endif]-->
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tr>
                          <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                  <p><span style="font-size: 16px;">Thanks for your submission.</span></p>
                                  </br>
                                  <p><span style="font-size: 16px;">We have received your submission regarding the Program  ${program_name}. </span></p>
                              </br>
                                  <p><span style="font-size: 16px;"> Our team would check the report as soon as possible also you can click
                                      <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                            <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                        </a> to check report. </span></p>
                                  </br>
                                  <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions.    </span></p>
                            </div>
                          </td>
                      </tr>
                    </br>
                   ${sign}
                  </table>
              </div>
          </td>
      </tr>
      </tbody>
  </table>
</div>`
};

emailTemplateSubmitReportCompany = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
      <tbody>
      <tr>
          <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
          <td
             class="" style="vertical-align:top;max-width:600px;"
          >
        <![endif]-->
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tr>
                          <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                  <p><span style="font-size: 16px;">You have received new submission regarding the program ${program_name},</span></p>
                                  <p><span style="font-size: 16px;">You can find this new submission in your company dashboard or click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                            <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                        </a> to check report.</span></p>
                                  </br>
                                  <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
                                  </span></p>
                                  </br>
                            </div>
                          </td>
                      </tr>
                      ${sign}
                  </table>
              </div>
          </td>
      </tr>
      </tbody>
  </table>
</div>`
};

emailTemplateSubmitReportModerator = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">There is a New Submission Regarding the Program ${program_name}. Click <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                        <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                    </a> to check report </span></span></p>
                                    </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateChangeReportStatusHacker = function (url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
      <tbody>
      <tr>
          <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
          <td
             class="" style="vertical-align:top;max-width:600px;"
          >
        <![endif]-->
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tr>
                          <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                  <p><span style="font-size: 16px;">There is a change in the status of your submitted report. You can check it from your dashboard or click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                              <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                          </a> to check report.</span></p>
                              </br>
                                  </br>
                                  <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
                                  </span></p>
                                  </br>
                            </div>
                          </td>
                      </tr>
                      ${sign}
                  </table>
              </div>
          </td>
      </tr>
      </tbody>
  </table>
</div>`;
};

emailTemplateChangeReportStatusCompany = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">Your received submission status regarding the program ${program_name} has been changed.</span></p>
                                    <p><span style="font-size: 16px;">You can check the new status on your company dashboard or click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                            </a> to check report.</span></p>
                                </br>
                                    </br>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
                                    </span></p>
                                    </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateChangeReportStatusModerator = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">There is a change in the report Submission Regarding the Program ${program_name}.</span></p>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">Click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                            </a> to check report</span></p>
                                </br>
                                    </br>
                                  
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateRegisterCompany = function (url, sign) {
    return `<!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Thank you for registering your company on our Platform. </span>
                                                          <br>
                                                          <span style="font-size: 16px;">Before you log in, please verify your email address.</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:0 15px 20px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fe5000;">
                                                        <a href="#" style="color: #fe5000;font-size: 16px;">
                                                            <strong style="color: #fe5000; font-weight: normal;">support@securebug.se</strong>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <!--[if mso | IE]>
                                                                  </td>
                                                                </tr>
                                                              </table>
                                                              <table
                                                                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                                                              >
                                                                <tr>
                                                                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                              <![endif]-->
                                    <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" class="darkmode">
                                            <tbody>
                                            <tr>
                                                <td style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;">
                                                    <!--[if mso | IE]>
                                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td
                                                   class="" style="vertical-align:top;width:300px;"
                                                >
                                              <![endif]-->
                                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                            <tr>
                                                                <td align="left" style="font-size:0px;padding:15px;word-break:break-word;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td style="width:100%;">
                                                                                <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                                    <span style="color: #fe5000;font-size: 14px;font-weight: bold;border-radius: 12px;  border: 1px solid #fe5000;padding: 15px 8px; font-family:Ubuntu, Helvetica, Arial, sans-serif;">Click here to Verify your Email Address</span>
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                     ${sign}
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateCompanyRegistrationForSupport = function (first_name, last_name, email, role, organizationName, phone, country) {
    return `<!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;max-width:600px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                          <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">First Name : ${first_name}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                          <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Last Name : ${last_name}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                          <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Email : ${email}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">

                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Role : ${role}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Organization Name : ${organizationName}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Phone : ${phone}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;">Country : ${country}</span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
}

emailTemplateCompanyInviteMemberForCompany = function (role, member_name, creator, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 0 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                      ${creator} have successfully added ${member_name} as a team member with the following role (${role}) into your company.   </span></p>
                                 <br/>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
</div>`
};

emailTemplateCompanyInviteMemberForSupport = function (parent_display_name, creator_first_name, creator_last_name, member_fn, member_ln, member_email, role, sign) {
    return `<!--[if mso | IE]>
                          </td>
                        </tr>
                      </table>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="max-width:600px;"
                      >
                        <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
                            <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                                    <!--[if mso | IE]>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td
                                   class="" style="vertical-align:top;width:240px;"
                                >
                              <![endif]-->
                                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tr>
                                                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;margin-bottom:8px">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">The following person has been invited to the ${parent_display_name} company By ${creator_first_name} ${creator_last_name}.</span></span></p>
                                                    </div>
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;margin-bottom:8px">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">Name : ${member_fn} ${member_ln}</span></span></p>
                                                    </div>
                                                    <br/>
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;margin-bottom:8px">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">Email : ${member_email}</span></span></p>
                                                    </div>
                                                    <br/>
                                                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                                        <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">Role : ${role}</span></span></p>
                                                    </div>
                                                </td>
                                            </tr>
                                            ${sign}
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>`
};

emailTemplateVerifyIdentifyHackerForSupport = function (identity, username, sign) {
    return ` <div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">New Hunter has Verified their identification by uploading identity ${identity} file by ${username}.</span></p>
        </br>
            </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateWithdrawRequestForHacker = function (amount, tracking_code, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                    </span></p>
                                    <p><span style="font-size: 16px;">Thanks for your valuable participation in our Program!</span></a></span></p>
                                 <br/>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                        In order to withdraw your bounty, please complete invoice form <a target="_blank" href="https://forms.gle/11U5yNVYpQonmgPb6" style="color:#ff5b10;text-decoration: none;">here</a> . </span></p>
                                      
                              </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;"><span style="color:#ff5b10;">${amount} €</span></span></span></p>
                                    <p><span style="font-size: 16px;">Reference number: <span style="color:#ff5b10;">${tracking_code}</span></span></span></p>
                                    <br/>
                                    </div>
                              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">You have to also add your bug bounty reference number to the form.</span></span></p>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateWithdrawRequestForSupport = function (user_name, amount, tracking_code, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;margin-bottom:24px">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">A withdrawal request with the following bug bounty reference <span style="color:#ff5b10;">${tracking_code}</span> for the amount of <span style="color:#ff5b10;">${amount} €</span>, has been generated by the ${user_name}. </span></span></p>
                                </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateWithdrawAcceptForHacker = function (amount, tracking_code, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                    </span></p>
                                    <p><span style="font-size: 16px;">Your withdrawal request has been paid.</span></a></span></p>
                              </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;"><span style="color:#ff5b10;">${amount} €</span></span></span></p>
                                    <p><span style="font-size: 16px;">Reference number: <span style="color:#ff5b10;">${tracking_code}</span></span></span></p>
                                    <br/>
                                    </div>
                              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">Please refrain from disclosing any information related to this vulnerability report without the prior agreement of the bug bounty program administrator.</span></span></p>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`;
}

emailTemplateCommentForHacker = function (url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">A comment has been added to your submitted report. You can check it from your dashboard or click       <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                        <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                    </a> to check report.</span></p>
        </br>
            </br>
            <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
            </span></p>
                                  
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateCommentForCompany = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">A comment has been added to the submission you received regarding program ${program_name}.</span></p>
                                    <p><span style="font-size: 16px;">You can check the new status on your company dashboard or click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                            </a> to check report.</span></p>
                                </br>
                                    </br>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
                                    </span></p>
                                    </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateCommentForModerator = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">A comment has been added to the submission Regarding the Program ${program_name}.</span></p>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">Click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                            </a> to check report</span></p>
                                    </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateAddRewardForHacker = function (url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">There is a reward for your submitted report. You can check it from your dashboard or click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                        <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                    </a> to check report.
              </span></p>
        </br>
            </br>
            <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
            </span></p>
            </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateAddRewardForCompany = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">The bounty has been awarded for a submitted report regarding program ${program_name}. </span></p>
                                    <p><span style="font-size: 16px;">You can check the new status on your company dashboard or click  <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                            </a> to check report.</span></p>
                                </br>
                                    </br>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;">Please don't hesitate to contact us in case you had any questions. 
                                    </span></p>
                                    </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateAddRewardForModerator = function (program_name, url, sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">The bounty has been awarded for a submitted report regarding program  ${program_name}.</span></p>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> <span class="user-name">Click   <a href="${url}" target="_blank" style="padding: 0; margin: 0; outline: 0;text-decoration: none;">
                                                                <span style="color: #fe5000;font-weight: bold; font-family:Ubuntu, Helvetica, Arial, sans-serif;">here</span>
                                                            </a> to check report</span></p>
                                    </br>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`
};

emailTemplateForChampionsHackers = function (sign) {
    return `<div style="background:#282828;background-color:#282828;Margin:0px auto;max-width:600px;" bgcolor="#282828" class="darkmode">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#282828;background-color:#282828;width:100%;" bgcolor="#282828" class="darkmode">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td
               class="" style="vertical-align:top;max-width:600px;"
            >
          <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;"> 
                                    </span></p>
                                    <p><span style="font-size: 16px; font-weight:bold">Congratulations!</span></a></span></p>
                                 <br/>
                                    <p><span style="font-size: 16px;color: #fcf5eb !important;font-weight:bold"> 
                                        You have passed the vetting process successfully and have been selected as one of the SecureBug champions. </span></p>
                              </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 15px 15px 15px;word-break:break-word;">
                              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#fcf5eb;">
                                    <p><span style="font-size: 16px;">We are pleased to have you in our team and look forward to many years of cooperation protecting the world against cyberthreats and security vulnerabilities.</span></span></p>
                              </div>
                            </td>
                        </tr>
                        ${sign}
                    </table>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
  </div>`;
};