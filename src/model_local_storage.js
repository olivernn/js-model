;(function(Model) {
  Model.localStorage = function(klass) {
    klass.persistence = new Model.localStorage.Persistence(klass)
  }

  var persistence = Model.localStorage.Persistence = function(klass) {
    this.klass = klass
    this.collection_id = [klass._name, "collection"].join("-")
  }

  var del = function(key) {
    localStorage.removeItem(key)
  }

  var get = function(key) {
    var data = localStorage.getItem(key)
    return data && JSON.parse(data)
  }

  var set = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  var sadd = function(key, member) {
    var members = get(key) || []

    if (!~members.indexOf(member)) {
      members.push(member)
      set(key, members)
    }
  }

  var srem = function(key, member) {
    var members = get(key) || []
    var index = members.indexOf(member)

    if (~index) {
      members.splice(index, 1)
      set(key, members)
    }
  }

  Model.Utils.extend(persistence.prototype, {
    destroy: function(model, callback) {
      del(model.uid)
      srem(this.collection_id, model.uid)
      if (callback) callback(true)
    },

    newRecord: function(model) {
      var uids = get(this.collection_id) || []
      return ~uids.indexOf(model.uid)
    },

    read: function(callback) {
      if (!callback) return

      var existing_uids = this.klass.collection.map(function(model) {
        return model.uid
      })
      var uids = get(this.collection_id) || []
      var models = []
      var attributes, model, uid

      for (var i = 0, length = uids.length; i < length; i++) {
        uid = uids[i]

        if (!~existing_uids.indexOf(uid)) {
          attributes = get(uid)
          model = new this.klass(attributes)
          model.uid = uid
          models.push(model)
        }
      }

      callback(models)
    },

    save: function(model, callback) {
      set(model.uid, model)
      sadd(this.collection_id, model.uid)
      callback(true)
    }
  })
})(Model);
