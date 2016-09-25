/**
 * Template: list
 * Description: Module for showing a list of objects
 * helpers: item_name, is_disabled
 * events: click #add-item, click #delete-item, click #edit-item
 * Author: Jeff Rodgers
 * Since: Version 2.0
 */

Template.list.helpers({
  "col_name" : function() {
    if (Session.get("isSubCollection"))
      return Session.get("subCollection");
    else
      return Session.get("collectionName");
  },
  "subcol_name" : function() {
    if (Session.get("isSubCollection"))
      return "";
    else
      return Session.get("subCollection");
  },
  "item_name": function(){

    var name = "";
    var parsed_name = "";
    if (this.common_name) {
      name = this.common_name;
    } else if (this.title) {
      name = this.title;
    } else if (this.profile) {
      name = this.profile.display_name;
    } else if (this.username) {
      name = this.username;
    } else if (this.resource_id) {
      var parent = this.resource_id;
      Meteor.subscribeWithPagination("resources", 500, {_id:parent});
      var item = ResourceList.findOne({_id: parent});
      if (item)
        name = item.common_name + " - " + item.chapter;
    } else {
      parsed_name = Session.get('subCollection');
      name = parsed_name.replace("List", "");
    }
    return name;
  },

  "is_disabled": function() {
    if (this.username == "admin") {return "disabled";}
  },

  "image": function() {
    var item,image = "";
    var file_type = "";
    if (this.file_path) {
      item = this.file_path;
      file_type = "/"
    } else if (this.avatar) {
      item = this.avatar;
      file_type = "";
    } else if (this.profile) {
      item = this.profile.avatar;
      file_type = "";
    }

    if (item) {
      var extension = item.replace(/^.*\./, '');

      switch(extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'JPG':
        case 'JPEG':
        case 'PNG':
          image = item;
      }
    }

    if (image) {
      if(Meteor.isCordova){
        console.log("Is Cordova");
        image = "http://192.168.1.143:3000" + file_type + image;
      }
      return image;
    }

  },

  "additional": function() {
    var single = Session.get("isSingle");
    var collectionName, additional = "";
    var self = this._id;

    if (single) {
      collectionName = Session.get('subCollection');
    } else {
      collectionName = Session.get('collectionName');
    }

    switch (collectionName) {
      case 'VendorList':
        if (this.city) {
          additional = this.industry + " - " + this.city;
        } else {
          additional = this.industry;
        }

        break;
      case 'VendorContactList':
        //Meteor.subscribe("vendors");
        var parent = VendorList.findOne({_id:this.location_id});
        if (!parent) {
          Meteor.subscribeWithPagination("vendorLocation", 10, {_id:this.location_id});
          parent = VendorLocationList.findOne({_id:this.location_id});
        }
        if (parent) {
          additional = parent.industry;
        }

        break;
      case 'CallListList':
        var user_id = this.user_id;
        //Meteor.subscribe("users");
        var user = Meteor.users.findOne({_id: user_id});
        if (user) {
          additional = user.profile.title;
        }
        break;
    }

    return additional;
  },

  "hasMore": function() {
      var collection = Session.get("collectionName");

      if (Session.get("topMenu") && collection == "UserList" && userCollection) {
        return Meteor.users.sorted(userCollection.loaded()).count() == userCollection.limit();
      }
  }

});

Template.list.events({

  "click #add-item": function(event) {
    event.preventDefault();

    Session.set("formVar", {mode:"Add", isCreating:true, submit:"Add"});
    Session.set("formMode", "singleItem");

    var single = Session.get("isSingle");
    var parent, collectionName = "";

    if (single) {
      parent = Template.parentData()._id;
      collectionName = Session.get('subCollection');
    } else {
      parent = false;
      collectionName = Session.get('collectionName');
    }

    var single_title = collectionName.replace('List','');

    Session.set("singleTitle", single_title);

    if (collectionName) {

      $('#addModal')
          .modal({
            onVisible: function() {
              $('#addModal').modal('refresh');
              tinymce.init({
                selector: '.editor',
                skin_url: '/packages/teamon_tinymce/skins/lightgray',
                menubar: false
              });
            },
            onShow: function() {
              if (getRealCollection(collectionName) == "CallListList")
                Meteor.subscribe("users");
            },
            onHidden: function() {
              setTimeout(resetDataForm, 50);
            },
            onApprove : function() {
              getEditorData();
              var formValidationRules = getFormValidation();
              var formSettings = {
                on: 'submit',
                inline: true,
                fields: formValidationRules,
                onSuccess: function(e) {
                  e.preventDefault();
                  var item = submitForm(collectionName,parent);

                  if (collectionName === "UserList") {
                    var role = $('#userType').val();
                    var company = $('#companyValue').val();
                    var newPassword = $('#passwordValue').val();
                    var newUserID = Meteor.users.insert(item);
                    Meteor.call("setUserPassword", newUserID, newPassword);

                    Meteor.call("addUserRoles", newUserID, role, company);
                    var newUserRoles = Meteor.call("getUserRoles", newUserID);
                  } else {
                    window[getRealCollection(collectionName)].insert(item);
                  }
                  $('#addModal').modal('hide');
                  resetDataForm();

                  return true;

                },
                onFailure: function(formErrors) {
                  $("#addModal").modal("refresh");
                  return false;
                }
              };

              $('.ui #sc_form').form(formSettings);

              $('.ui #sc_form').form('submit');
              return false;
            },
            onDeny : function(e) {
              $('#addModal').modal('hide');
              setTimeout(resetDataForm, 50);
            }
          })
          .modal('setting', 'transition', 'scale')
          .modal('setting', 'autoFocus', true)
          .modal('show')
        ;
    }
  },

  "click #delete-item": function(event) {
    event.preventDefault();
    var self = this._id;
    var collectionName = "";
    var single = Session.get("isSingle");

    if (single) {
      collectionName = Session.get('subCollection');
    } else {
      collectionName = Session.get('collectionName');
    }

    $('#deleteModal')
        .modal({
          onApprove : function() {
            if (collectionName === 'UserList') {
              Meteor.users.remove(self);
            } else if(collectionName === 'StaffCallList' || collectionName === 'CorporateCallList') {
              Meteor.call("RemoveFromDatabase", "CallListList", self);
            } else {
              Meteor.call("RemoveFromDatabase", collectionName, self);
            }
          }
        })
        .modal('setting', 'transition', 'scale')
        .modal('show')
      ;
  },

  "click #edit-item": function(event) {
    event.preventDefault();

    var obj = this;
    var self_obj = this._id;
    var old_id = Session.get("currentObjectID");
    var collectionName = "";

    Session.set("formVar", {mode:"Edit", submit:"Save"});
    Session.set("formMode", "singleItem");
    Session.set("currentObjectID", self_obj);

    var single = Session.get("isSingle");

    if (single) {
      collectionName = Session.get('subCollection');
    } else {
      collectionName = Session.get('collectionName');
    }

    var single_title = collectionName.replace('List','');

    Session.set("singleTitle", single_title);
    if (collectionName) {
      $('#addModal')
          .modal({
            onVisible: function() {
              fillForm(collectionName, obj);
              $('#addModal').modal('refresh');
              tinymce.init({
                selector: '.editor',
                skin_url: '/packages/teamon_tinymce/skins/lightgray',
                menubar: false
              });
            },
            onHidden: function() {
              Session.set("currentObjectID", old_id);
              setTimeout(resetDataForm, 50);
            },
            onApprove : function() {
              getEditorData();
              var formValidationRules = getFormValidation();
              var mode = Session.get("formVar");
              mode = mode.mode;

              if (mode == "Edit" && collectionName == "UserList") {
                formValidationRules.passwordValue = {
                  identifier: 'passwordValue',
                  optional: true,
                  rules: [
                    {
                      type   : 'length[6]',
                      prompt : 'Your password must be at least {ruleValue} characters.'
                    }
                  ]
                };

                formValidationRules.passConfirmValue = {
                  identifier: 'passConfirmValue',
                  optional: true,
                  rules: [
                    {
                      type: 'empty',
                      prompt: 'Please re-enter your password to confirm.'
                    },
                    {
                      type   : 'match[passwordValue]',
                      prompt : 'Your passwords do not match'
                    }
                  ]
                };
              }
              var formEditSettings = {
                on: 'submit',
                inline: true,
                fields: formValidationRules,
                onSuccess: function(e) {
                  e.preventDefault();

                  var item = submitForm(collectionName);

                  if (collectionName === "UserList") {
                    var role = $('#userType').val();
                    var company = $('#companyValue').val();
                    var newPassword = $('#passwordValue').val();
                    var newUserID = Meteor.users.update({_id:self_obj}, {$set:item});
                    var old_roles = Meteor.call("getUserRoles", self_obj);

                    if (newPassword) {
                      Meteor.call("setUserPassword", self_obj, newPassword);
                    }
                    if (role) {
                    //  Meteor.call("removeUserRoles", self_obj, "staff", "default-group");
                    //  Meteor.call("removeUserRoles", self_obj, "admin", "default-group");
                      Meteor.call("setUserRoles", self_obj, role, company);
                    } else {
                      console.log("No Role Set");
                    }

                  } else {
                    window[getRealCollection(collectionName)].update({_id:self_obj}, {$set:item});
                  }


                  $('#addModal').modal('hide');
                  setTimeout(resetDataForm, 50);
                  Session.set("currentObjectID", old_id);
                  return true;
                  //resetDataForm();
                },
                onFailure: function(formErrors) {
                  Session.set("formErrors",formErrors);
                  $("#addModal").modal("refresh");
                  Session.set("currentObjectID", old_id);
                  return false;
                }
              };

              $('.ui #sc_form').form(formEditSettings);

              $('.ui #sc_form').submit();
              return false;

            },
            onDeny : function() {
              $('#addModal').modal('hide');
              setTimeout(resetDataForm, 50);
              Session.set("currentObjectID", old_id);
            }

          })
          .modal('setting', 'transition', 'scale')
          .modal('show')
        ;
    }

  },
  "click #loadMore": function(e) {
    e.preventDefault();
    if (Session.get("topMenu") && userCollection) {
      userCollection.loadNextPage();
    }
  }

});

Template.list.onCreated( function() {


});

/**
 * Template: listHeader
 * Description: Header for the list template
 * helpers: sub_items, is_disabled
 * events: click #list-header-menu-toggle, click #subcol
 * Author: Jeff Rodgers
 * Since: Version 2.0
 */

Template.listHeader.helpers({
  "sub_items": function(){
    var items = Session.get("listItems");
    return items;
  },

  "single": function(){
    var col = Session.get("collectionName");

    if (col !== "RequestList") {
      return Session.get("isSingle");
    } else {
      return false;
    }

  }
});

Template.listHeader.events({
  "change .list-header-dropdown": function(){
    //$('.subcollection-list').dropdown();
  },

  "touchstart .list-header-menu-toggle": function(e) {
    console.log("Touch Event");
    e.stopPropagation();
  },

  /*"click #list-header-menu-toggle":function(event, template){
    event.stopPropagation();
    template.$("#list-header-menu-ul").slideToggle('fast');
    $('html, body').animate({
        scrollTop: template.$(".list-header").offset().top
    }, 600);
  },*/
  /*"click #list-header-toggle": function() {
    $('.subcollection-list').dropdown();
  },*/

  "click #subcol": function(event, template){
    event.preventDefault();

    var subcol = this.link;
    var title = this.name;
    var filters = Session.get("collectionFilters");
    var subs = getSubscription(subcol);
    var id = Session.get("currentObjectID");
    var col = Session.get("collectionName");
    defaultSubCollection[col] = subcol;
    Session.set(id, subcol);
    var new_subscription = Meteor.subscribeWithPagination(subs);

    //if (new_subscription.ready())
    {
      if (subcol.indexOf("List") >=0) {
        var single = subcol.replace('List','');
        if (Template.parentData())
          filters.parent_id = Template.parentData()._id;
        Session.set("subCollection", subcol);
        if (title == "Corporate Call List") {
          filters.corporate = "Yes";
        } else if (title == "Staff Call List") {
          filters.corporate = "No";
        }
        Session.set("pluralTitle", title);
        Session.set("singleTitle", single);
        console.log (filters);
        Session.set("collectionFilters", filters);

        if (window.location.pathname != "/"+col+"_"+subcol+"_"+id)
          Router.go("/"+col+"_"+subcol+"_"+id);

      } else {
        Router.go("/" + subcol);
      }
    }
    //template.$("#list-header-menu-ul").slideToggle('fast');
  }

});

Template.listHeader.onRendered( function() {
  var collection = Session.get("collectionName");
  var subcollection = Session.get("subCollection");
  var filters = Session.get("collectionFilters");
  var parent = Session.get("currentObjectID");

  Tracker.autorun(function(){
    var items = [];
    var parents = getParents(filters.parent_id);
    var parent_company, company_name = "";

    $.each(parents, function(index, value) {
      parent_company = CompanyList.findOne({_id: value});
      if (parent_company) {
        company_name = parent_company.common_name;
      }
    });

    $("#showLoading").show();

    switch(collection) {
      case "CompanyList":
        if (Blaze._globalHelpers.is_admin() === true) {
          for (var obj in company_items) {
            items.push({name:obj,link:company_items[obj]});
          }
        } else {
          for (var obj in company_items) {
            var query = ReactiveMethod.call('getCollectionCount',company_items[obj], parent);

            if (query > 0) {
              collection_subscribe (company_items[obj]);
              items.push({name:obj,link:company_items[obj]});
            }
          }
        }
        break;
      case "PropertyList":

        if (Blaze._globalHelpers.is_admin() === true) {
          for (var obj in property_items) {
            if (company_name == "Winn" && obj == "Shut-Offs") {
              console.log("Skipping default Shut-Offs");
            } else {
              items.push({name:obj,link:property_items[obj]});
            }
          }
        } else {
          for (var obj in property_items) {

            var query = ReactiveMethod.call('getCollectionCount',property_items[obj], parent);

            if (query > 0) {
              collection_subscribe (property_items[obj]);
              items.push({name:obj,link:property_items[obj]});
            }
          }
        }

        if (company_name == "Winn") {
          if (Blaze._globalHelpers.is_admin() === true) {
            for (var obj in custom_items) {
              items.push({name:obj,link:custom_items[obj]});
            }
          } else {
            for (var obj in custom_items) {

              var query = ReactiveMethod.call('getCollectionCount',custom_items[obj], parent);

              if (query > 0) {
                collection_subscribe (custom_items[obj]);
                items.push({name:obj,link:custom_items[obj]});
              }
            }
          }
        }
        break;
      case "BuildingList":
        if (Blaze._globalHelpers.is_admin() === true) {
          for (var obj in building_items) {
            if (company_name == "Winn" && obj == "Shut-Offs") {
              console.log("Skipping default Shut-Offs");
            } else {
              items.push({name:obj,link:building_items[obj]});
            }
          }
        } else {
          for (var obj in building_items) {
            var query = ReactiveMethod.call('getCollectionCount',building_items[obj], parent);

            if (query > 0) {
              collection_subscribe (building_items[obj]);
              items.push({name:obj,link:building_items[obj]});
            }
          }
        }
        if (company_name == "Winn") {
          if (Blaze._globalHelpers.is_admin() === true) {
            for (var obj in custom_items) {
              items.push({name:obj,link:custom_items[obj]});
            }
          } else {
            for (var obj in custom_items) {
              var query = ReactiveMethod.call('getCollectionCount',custom_items[obj], parent);

              if (query > 0) {
                collection_subscribe (custom_items[obj]);
                items.push({name:obj,link:custom_items[obj]});
              }
            }
          }
        }
        break;
      case "SiteList":
        if (Blaze._globalHelpers.is_admin() === true) {
          for (var obj in site_items) {
            if (company_name == "Winn" && obj == "Shut-Offs") {
              console.log("Skipping default Shut-Offs");
            } else {
              items.push({name:obj,link:site_items[obj]});
            }
          }
        } else {
          for (var obj in building_items) {
            var query = ReactiveMethod.call('getCollectionCount',site_items[obj], parent);

            if (query > 0) {
              collection_subscribe (site_items[obj]);
              items.push({name:obj,link:site_items[obj]});
            }
          }
        }

        if (company_name == "Winn") {
          if (Blaze._globalHelpers.is_admin() === true) {
            for (var obj in custom_items) {
              items.push({name:obj,link:custom_items[obj]});
            }
          } else {
            for (var obj in custom_items) {
              var query = ReactiveMethod.call('getCollectionCount',custom_items[obj], parent);

              if (query > 0) {
                collection_subscribe (custom_items[obj]);
                items.push({name:obj,link:custom_items[obj]});
              }
            }
          }
        }
        break;
      case "RequestList":
        if (Blaze._globalHelpers.is_admin() === true) {
          for (var obj in request_items) {
            items.push({name:obj,link:request_items[obj]});
          }
        } else {
          for (var obj in request_items) {
            var query = ReactiveMethod.call('getCollectionCount',request_items[obj], parent);

            if (query > 0) {
              collection_subscribe (request_items[obj]);
              items.push({name:obj,link:request_items[obj]});
            }
          }
        }
        break;
      case "VendorList":
        if (Blaze._globalHelpers.is_admin() === true) {
          for (var obj in vendor_items) {
            items.push({name:obj,link:vendor_items[obj]});
          }
        } else {
          for (var obj in vendor_items) {
            var query = ReactiveMethod.call('getCollectionCount',vendor_items[obj], parent);

            if (query > 0) {
              collection_subscribe (vendor_items[obj]);
              items.push({name:obj,link:vendor_items[obj]});
            }
          }
        }
        break;
    }
    $("#showLoading").hide();
    Session.set("listItems", items);
    setTimeout(function() {
      //$('.subcollection-list').dropdown();
      //$('.subcollection-list').dropdown("show");
    });
  });


});

/**
 * Template: crList
 * Description: Module for showing a list of change request objects
 * helpers: item_name, data_item
 * events: click #add-item, click #delete-item, click #edit-item
 * Author: Jeff Rodgers
 * Since: Version 2.0
 */

 Template.crList.helpers({
   "col_name" : function() {
     if (Session.get("isSubCollection"))
       return Session.get("subCollection");
     else
       return Session.get("collectionName");
   },
   "item_name": function(){

     var name = this.request_title;

     return name;
   },

   "data_item": function() {

     var filters = Session.get("collectionFilters");
     var filter = {};

     if (filters) {
       filter = filters;
     }

     var cur_user = Meteor.userId();
     if (isAdmin(cur_user)) {
       return RequestList.find(filter);
     } else {
       filter.created_by = cur_user;
       return RequestList.find(filter);
     }
   },
 });

 Template.crList.events({

   "click #delete-item": function(event) {
     event.preventDefault();
     var self = this._id;

     var single = Session.get("isSingle");

     if (single) {
       var collectionName = Session.get('subCollection');
     } else {
       var collectionName = Session.get('collectionName');
     }

     $('#deleteModal')
         .modal({
           onApprove : function() {
             if (collectionName === 'UserList') {
               Meteor.users.remove(self);
             } else {
               Meteor.call("RemoveFromDatabase", collectionName, self);
             }
           }
         })
         .modal('setting', 'transition', 'scale')
         .modal('show')
       ;
   },

   "click #assign-item": function(event) {
     event.preventDefault();
     var self = this._id;

     Session.set("formVar", {mode:"Assign", submit:"Assign"});
     Session.set("formMode", "singleItem");

     var collectionName = "RequestList";

     var single_title = collectionName.replace('List','');

     Session.set("singleTitle", single_title);

     $('#assignModal')
         .modal({
           onApprove : function() {
             var item = {
               "assigned_user": $('.ui.dropdown').dropdown('get value')[1],
               "status": "Active"
             };
             RequestList.update({_id:self}, {$set:item});
           }
         })
         .modal('setting', 'transition', 'scale')
         .modal('show')
       ;
   },
 });

 /**
  * Template: crListHeader
  * Description: Header for the crList template
  * helpers: sub_items, list_title
  * events: click #list-header-menu-toggle, click #subcol
  * Author: Jeff Rodgers
  * Since: Version 2.0
  */

 Template.crListHeader.helpers({
   "sub_items": function(){

     var items = [];

     for (var obj in request_items) {
       items.push({name:obj,link:request_items[obj]});
     }

     return items;
   },

   "list_title": function() {
     var name = Session.get("pluralTitle");

     return name;
   }
 });

 Template['crListHeader'].events({
   "click #list-header-menu-toggle":function(event, template){
     template.$("#list-header-menu-ul").slideToggle('fast');
   },

   "click #subcol": function(event, template){
     event.preventDefault();

     var title = this.name;
     var list_title = "";

     if (title == "My Requests") {
       var filters = {"assigned_user": Meteor.userId()};
       list_title = "My ";
     } else if (title == "All"){
       var filters = "";
       list_title = "All ";
     } else {
       var filters = {"status": title};
       list_title = title + " ";
     }

     list_title = list_title + "Change Requests";

     Session.set("collectionFilters",filters);
     Session.set("pluralTitle", list_title);

     template.$("#list-header-menu-ul").slideToggle('fast');
   }


 });

 Template.crListHeader.onRendered( function() {
   $('.subcollection-list').dropdown();
 });
