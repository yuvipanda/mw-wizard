// page: User:Yuvipanda/wizard/drn.js
( function() {
    if( mw.wizard ) {
        mw.wizard.initialize( {
            getSectionText: function( data ) {
                 var report = "{{DR case status}}\n" +
                              "{{drn filing editor|{{subst:REVISIONUSER}}|~~~~~}}\n" + 
                              "{{subst:DNAU|14}}" + 
                              "<!-- PLEASE REMOVE THE PREVIOUS COMMENT WHEN CLOSING THIS THREAD. (Otherwise the thread won't be archived until the date shown.) -->\n\n";
 
                //On Talk Page
                report += "<span style=\"font-size:110%\">'''Have you discussed this on a talk page?'''</span>\n";
                report += "\nYes, I have discussed this issue on a talk page already.\n\n";

                //Article Title
                report += "<span style=\"font-size:110%\">'''Location of dispute'''</span>\n";
                var articles = data[ 'disputed-article' ].split(',');
                $.each( articles, function( i, article ) {
                    if( $.trim( article ) !== '' ) {
                        report += "* {{pagelinks|" + article +"}}\n";
                    }
                } );

                //Involved users
                report += "<span style=\"font-size:110%\">'''Users involved'''</span>\n";
                var users = data[ 'involved-users' ].split(',');
                $.each( users, function( i, user ) {
                    if( $.trim( user ) !== '' ) {
                        report += "* {{User|" + user +"}}\n";
                    }
                } );

                //Dispute Description
                report += "<span style=\"font-size:110%\">'''Dispute overview'''</span>\n";
                report += "\n"+ data[ 'overview' ]+"\n\n";

                //Previous forums
                report += "<span style=\"font-size:110%\">'''Have you tried to resolve this previously?'''</span>\n";
                report += "\n"+ data[ 'other-steps' ] +"\n\n";

                //Desired Outcome
                report += "<span style=\"font-size:110%\">'''How do you think we can help?'''</span>\n";
                report += "\n" + data[ 'expected-outcome' ] +"\n\n";

                //User statements
                var currentUser = mw.user.getName();
                $.each( users, function( i, user ) {
                    if( $.trim( user ) !== currentUser && $.trim( user ) !== '' ) {
                        report += "==== Opening comments by " + user + " ====\n<div style=\"font-size:smaller\">Please limit to 2000 characters - longer statements may be deleted in their entirety or asked to be shortened. This is so a volunteer can review the dispute in a timely manner. Thanks.</div>\n\n";
                    }
                } );

                //Discussion
                report += "=== " + data[ 'disputed-article' ] + " discussion ===\n<div style=\"font-size:smaller\">Please do not use this for discussing the dispute prior to a volunteer opening the thread for comments - continue discussing the issues on the article talk page if necessary.</div>";

                return report;
            },
            getSectionTitle: function( data ) {
                return data[ 'disputed-article' ];
            },
            getEditSummary: function( data ) {
                return data[ 'disputed-article' ];
            },
            inputDefaults: {
                'involved-users': function() {
                    return mw.user.getName() + ',';
                }
            }
        } );
    }
} )();
