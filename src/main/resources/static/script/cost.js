var selectedId;
var selectedRow;
var costTable;
var costTableMobile;
var calculateCostTimeout;
var timeZoneOffset = (new Date()).getTimezoneOffset() * 60000;

// Initialize all input of type date
const calendarOptions = {
    type: 'date',
    showHeader: false,
    displayMode: 'default',
    color: 'primary',
    dateFormat: 'DD/MM/YYYY',
    onReady: function () {
    }
};

var purchaseDateFrom = bulmaCalendar.attach('#purchaseDateFrom', calendarOptions);
var purchaseDateTo = bulmaCalendar.attach('#purchaseDateTo', calendarOptions);
var purchaseDate = bulmaCalendar.attach('#purchaseDate', calendarOptions);

// prevent reload page when clear calendar
$('.datetimepicker-clear-button').attr('type', 'button');

$(function () {
    if (mobile) {
        costTableMobile = $('#costTableMobile').DataTable({
            "processing": true,
            "dom": 'ft<"bottom"lp>',
            "ordering": false,
            "info": false,
            "language": {search: '', searchPlaceholder: "filter"},
            "lengthMenu": [
                [10, 25, 50, -1],
                [10, 25, 50, 'All']
            ],
            "pageLength": 25,
            "initComplete": function (settings, json) {
                addClearFilter();
            },
            "ajax": {
                url: 'cost/search',
                type: 'POST',
                data: {
                    text: function () {
                        return $('#text').val()
                    },
                    purchaseDateFrom: function () {
                        return $('#purchaseDateFrom').val();
                    },
                    purchaseDateTo: function () {
                        return $('#purchaseDateTo').val();
                    },
                    type: function () {
                        return 'COST';
                    }
                }
            },

            "columns": [
                {
                    "data": "name",
                    render: function (name, type, row) {
                        // console.log(row)
                        var html = '<div class="cost-mobile-info">';
                        html += '<span><b>(' + row.purchaseDate + ' - ' + row.createdBy+ ') ' + name + '</b></span>';

                        var unit;
                        if (row.unit === 'PIECE') unit = ' (Cái)';
                        if (row.unit === 'METER') unit = ' (Mét)';
                        if (row.unit === 'KG') unit = ' (Kg)';
                        if (row.unit === 'STICK') unit = 'Cây';
                        if (row.unit === 'SET') unit = 'Bộ';
                        if (row.unit === null) unit = '';

                        if (row.pricePerUnit !== null) {
                            html += '<span><b>Số lượng: ' + dotSeparateNumber(row.quantity) + unit + ' x ' + dotSeparateNumber(row.pricePerUnit) + ' = ' + dotSeparateNumber(row.price) + '</b></span>';
                        } else {
                            html += '<span><b>Số lượng: ' + dotSeparateNumber(row.quantity) + unit + '</b></span>';
                        }

                        // if (row.description != '') {
                        //     html += '<span> Mô tả vật tư: ' + row.description + '</span>';
                        // }
                        if (row.provider != null) {
                            html += '<span> Cửa hàng: <b>' + row.provider.name + '</b></span>';
                            // html += '<span> Địa chỉ: ' + row.provider.address + '</span>';
                            html += '<span style="margin-bottom: 5px"> Điện thoại: ' + showPhone(row.provider.phone, row.provider.mobilePhone) + '</span>';
                        }

                        if (row.categories != null) {
                            for (var i = 0; i < row.categories.length; i++) {
                                html += ' <p class="tag is-primary is-small" data-id="' + row.categories[i].id + '" style="margin-right: 5px">' + row.categories[i].name + '</p>'
                            }
                        }

                        html += '<span class="has-text-right"><button class="button is-small is-link _update">Cập nhật</button><button class="button is-small is-danger _delete">Xóa</button></span>';
                        html += '</div>'
                        return html;
                    }
                }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('data-id', data.id);
                $(row).attr('data-name', data.name);
                $(row).attr('data-description', data.description);
                $(row).attr('data-purchase-date', data.purchaseDate);

                $(row).attr('data-quantity', data.quantity);
                $(row).attr('data-price-per-unit', data.pricePerUnit);
                $(row).attr('data-price', data.price);
            }
        });
        $("#costTableMobile thead").remove();
        $('#costTableMobile').removeClass('is-hidden');
        $('#costTable').remove();
    } else {
        costTable = $('#costTable').DataTable({
            "processing": true,
            "dom": 'ft<"bottom"lp>',
            "ordering": false,
            "info": false,
            "language": {search: '', searchPlaceholder: "filter"},
            "lengthMenu": [
                [10, 25, 50, -1],
                [10, 25, 50, 'All']
            ],
            "pageLength": 25,
            "initComplete": function (settings, json) {
                addClearFilter();
            },
            "ajax": {
                url: 'cost/search',
                type: 'POST',
                data: {
                    text: function () {
                        return $('#text').val()
                    },
                    purchaseDateFrom: function () {
                        return $('#purchaseDateFrom').val();
                    },
                    purchaseDateTo: function () {
                        return $('#purchaseDateTo').val();
                    },
                    type: function () {
                        return 'COST';
                    }

                }
            },

            "columns": [
                {
                    "data": "id",
                    render: function (provider) {
                        return '';
                    }
                },
                {"data": "purchaseDate",
                    render: function (purchaseDate, type, row) {
                        return purchaseDate + '<br/>' + row.createdBy
                    }
                },
                {
                    "data": "name",
                    render: function (name, type, row) {
                        var html = '';
                        html += name + '<br/>';
                        if (row.description !== null && row.description !== '') {
                            html += 'Chú thích: ' + row.description + '<br/>';
                        }

                        if (row.categories != null) {
                            html += '<span class="is-block" style="margin-bottom: 10px"></span>'
                            for (var i = 0; i < row.categories.length; i++) {
                                html += ' <p class="tag is-primary is-small" data-id="' + row.categories[i].id + '" style="margin-right: 5px">' + row.categories[i].name + '</p>'
                            }
                        }
                        return html;
                    }
                },
                {
                    "data": "quantity",
                    render: function (quantity, type, row) {
                        // var q = $.fn.dataTable.render.number('.', ',', 2, '').display(quantity);
                        var unit;
                        if (row.unit === 'PIECE') unit = 'Cái';
                        if (row.unit === 'METER') unit = 'Mét';
                        if (row.unit === 'KG') unit = 'Kg';
                        if (row.unit === 'STICK') unit = 'Cây';
                        if (row.unit === 'SET') unit = 'Bộ';
                        if (row.unit === null) unit = '';
                        if (unit !== '') {
                            return displayDecimalNumber(quantity) + '  ( ' + unit + ' )';
                        }

                        return displayDecimalNumber(quantity);
                    }
                },
                {
                    "data": "pricePerUnit",
                    render: $.fn.dataTable.render.number('.', '.', 0, '')
                },
                {
                    "data": "price",
                    render: $.fn.dataTable.render.number('.', '.', 0, '')
                },
                {
                    "data": "provider",
                    render: function (provider) {
                        if (provider != null) {
                            var html = '';
                            html += provider.name + '<br/>';
                            html += provider.address + '<br/>';
                            html += showPhone(provider.phone, provider.mobilePhone);
                            return html;
                        } else {
                            return '';
                        }
                    }
                },
                {
                    data: null,
                    defaultContent: '<span class="icon action _update" title="Cập nhật"><i class="fas fa-edit"></i></span>' +
                                    '<span class="icon action _delete" title="Cập nhật"><i class="fas fa-trash-alt"></i></span>'
                }
            ],
            createdRow: function (row, data, dataIndex) {

                $(row).attr('data-id', data.id);
                $(row).attr('data-name', data.name);
                $(row).attr('data-description', data.description);
                $(row).attr('data-purchase-date', data.purchaseDate);

                $(row).attr('data-quantity', data.quantity);
                $(row).attr('data-price-per-unit', data.pricePerUnit);
                $(row).attr('data-price', data.price);
            }
        });

        costTable.on('order.dt search.dt', function () {
            var totalRows = costTable.rows().count();
            costTable.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                cell.innerHTML = totalRows - (i);
            });
        }).draw();

        $('#costTable').removeClass('is-hidden');
        $('#costTableMobile').remove();
    }

    $("#provider").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                url: "/find/provider",
                data: {queryInput: request.term},
            }).done(function (data, status) {
                if (data.length > 0) {
                    response($.map(data, function (item) {
                        return {
                            label: item.name,
                            value: item.name,
                            id: item.id,
                            address: item.address,
                            description: item.description,
                            mobilePhone: item.mobilePhone,
                            phone: item.phone
                        };
                    }));
                }
            }).fail(function (data, status) {
                console.log('fail bro !' + status)
            });
        },
        change: function (event, ui) {
            if (ui.item === null) {
                $(this).val('');
                $('#newCostForm span').remove();
                $('#newCostForm br').remove();
            }
        },
        select: function (event, ui) {
            $("#provider").val(ui.item.value);
            $('#providerId').val(ui.item.id);
            $('#providerArea span').remove();
            $('#providerArea br').remove();
            $('#providerArea').append('<span>Địa chỉ: ' + ui.item.address + '</span><br/>');
            $('#providerArea').append('<span>Điện thoại: ' + showPhone(ui.item.phone, ui.item.mobilePhone) + '</span><br/>');
            $('#providerArea').append('<span>' + ui.item.description + '</span>');
            return false;
        },
        minLength: 2
    });

    $("#category").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                url: "/find/category",
                data: {queryInput: request.term},
            }).done(function (data, status) {
                if (data.length > 0) {
                    response($.map(data, function (item) {
                        return {
                            label: item.name,
                            value: item.name,
                            id: item.id
                        };
                    }));
                }
            }).fail(function (data, status) {
                console.log('fail bro !' + status)
            });
        },
        change: function (event, ui) {
            if (ui.item === null) {
                $(this).val('');
            }
        },
        select: function (event, ui) {
            $(this).val('');
            var length = $("#categoryArea input[type=hidden]").length;
            $("#categoryArea").append('<input type="hidden" data-value="' + ui.item.id + '" name="categoryIds[' + length + ']" value="' + ui.item.id + '" />');
            $("#categoryArea").append('<span class="tag is-primary is-medium" style="margin-bottom: 5px;margin-right: 5px">' + ui.item.value + '<button type="button" data-value="' + ui.item.id + '" class="delete is-small category-tag"></button></span>');
            resetCategoryTag('categoryArea');
            return false;
        },
        minLength: 2
    });

    $('#cancelDelete,#cancelCost,#cancelUpdateCost').on('click', function () {
        $(this).closest('.modal').removeClass('is-active');
    })

    $('#cancelUpdateItem').on('click', function () {
        $(this).closest('form').find('input[type=hidden]').val('');
        // $('#currentImage').attr('src', '');
        $('#newItem').show();
        $('#cancelUpdateItem').hide();
        $('#updateItem').hide();
    });

    $(document).on('click', '._update', function () {
        var costId = $(this).closest('tr').data('id');
        selectedRow = $(this).closest('tr');
        $.ajax({
            url: "/cost/update",
            type: "GET",
            data: {costId: costId}
        }).done(function (data, status) {
            if (status === 'success') {
                $('#updateCostModal .modal-card-body').replaceWith(data);
                bulmaCalendar.attach('#_purchaseDate', calendarOptions);
                $('.datetimepicker-clear-button').attr('type', 'button');
                formatNumber('#_pricePerUnit');
                formatNumber('#_price');

                $("#_provider").autocomplete({
                    source: function (request, response) {
                        $.ajax({
                            type: "GET",
                            url: "/find/provider",
                            data: {queryInput: request.term},
                        }).done(function (data, status) {
                            if (data.length > 0) {
                                response($.map(data, function (item) {
                                    return {
                                        label: item.name,
                                        value: item.name,
                                        id: item.id,
                                        address: item.address,
                                        description: item.description,
                                        mobilePhone: item.mobilePhone,
                                        phone: item.phone
                                    };
                                }));
                            }
                        }).fail(function (data, status) {
                            console.log('fail bro !' + status)
                        });
                    },
                    change: function (event, ui) {
                        if (ui.item === null) {
                            $(this).val('');
                            $('#updateCostModal span').remove();
                            $('#updateCostModal br').remove();
                        }
                    },
                    select: function (event, ui) {
                        $("#_provider").val(ui.item.value);
                        $('#_providerId').val(ui.item.id);
                        $('#_providerArea span').remove();
                        $('#_providerArea br').remove();
                        $('#_providerArea').append('<span>Địa chỉ: ' + ui.item.address + '</span><br/>');
                        $('#_providerArea').append('<span>Điện thoại: ' + showPhone(ui.item.phone, ui.item.mobilePhone) + '</span><br/>');
                        $('#_providerArea').append('<span>' + ui.item.description + '</span>');
                        return false;
                    },
                    minLength: 2
                });

                $("#_category").autocomplete({
                    source: function (request, response) {
                        $.ajax({
                            type: "GET",
                            url: "/find/category",
                            data: {queryInput: request.term},
                        }).done(function (data, status) {
                            if (data.length > 0) {
                                response($.map(data, function (item) {
                                    return {
                                        label: item.name,
                                        value: item.name,
                                        id: item.id
                                    };
                                }));
                            }
                        }).fail(function (data, status) {
                            console.log('fail bro !' + status)
                        });
                    },
                    change: function (event, ui) {
                        if (ui.item === null) {
                            $(this).val('');
                        }
                    },
                    select: function (event, ui) {
                        $(this).val('');
                        var length = $("#_categoryArea input[type=hidden]").length;
                        $("#_categoryArea").append('<input type="hidden" data-value="' + ui.item.id + '" name="categoryIds[' + length + ']" value="' + ui.item.id + '" />');
                        $("#_categoryArea").append('<span class="tag is-primary is-medium" style="margin-bottom: 5px;margin-right: 5px">' + ui.item.value + '<button type="button" data-value="' + ui.item.id + '" class="delete is-small category-tag"/></span>');
                        resetCategoryTag('_categoryArea');
                        return false;
                    },
                    minLength: 2
                });

                $('#updateCostModal').addClass('is-active');
            }
        }).fail(function (data, status) {
            console.log('fail bro !' + status)
        });
    })

    $(document).on('click', '#categoryArea .category-tag', function (event) {
        var value = $(this).data('value');
        $('#categoryArea input[data-value=' + value + ']').remove();
        $(this).parent().remove();
        resetCategoryTag('categoryArea');
    });

    $(document).on('click', '#_categoryArea .category-tag', function () {
        var value = $(this).data('value');
        $('#_categoryArea input[data-value=' + value + ']').remove();
        $(this).parent().remove();
        resetCategoryTag('_categoryArea');
    });

    $(document).on('keyup', '#_pricePerUnit, #_quantity', function () {
        if (calculateCostTimeout != null) {
            clearTimeout(calculateCostTimeout);
        }

        calculateCostTimeout = setTimeout(function () {
            calculateCost($('#_quantity').val(), $('#_pricePerUnit').val(), $('#_price'));
        }, 500);
    });

    $(document).on('keyup', '#pricePerUnit, #quantity', function () {

        if (calculateCostTimeout != null) {
            clearTimeout(calculateCostTimeout);
        }

        calculateCostTimeout = setTimeout(function () {
            calculateCost($('#quantity').val(), $('#pricePerUnit').val(), $('#price'));
        }, 500);
    });

    $("#updateCostForm").on('submit', function (event) {
        event.preventDefault();
        var form = $(this);
        var url = form.attr('action');

        $.ajax({
            type: "POST",
            url: url,
            data: form.serialize() // serializes the form's elements.
        }).done(function (responseBody, status) {
            if (responseBody.code === 'SUCCESS') {
                showMessage('SUCCESS', responseBody.messages[0]);
                $('#updateCostModal').removeClass('is-active');
                $('#updateCostForm').trigger('reset');

                if (mobile) {
                    costTableMobile.ajax.reload();
                } else {
                    costTable.ajax.reload();
                }
            } else {
                var data = JSON.parse(responseBody.data);
                console.table(data);
            }
        }).fail(function () {
            showAjaxFailedMessage();
        });
    });

    $(document).on('click', '#newCost', function () {
        $('#newCostForm span').remove();
        $('#newCostForm br').remove();
        $('#providerId').val('');
        $('#categoryArea').html('');
        $('#' + purchaseDate[0].id).find('.datetimepicker-dummy-input').val(today);
        $('#' + purchaseDate[0].id).find('#purchaseDate').val(today);
        $('#newCostModal').addClass('is-active');
    })

    $("#newCostForm").on('submit', function (event) {
        event.preventDefault();
        var form = $(this);
        var url = form.attr('action');

        $.ajax({
            type: "POST",
            url: url,
            data: form.serialize() // serializes the form's elements.
        }).done(function (responseBody, status) {
            if (responseBody.code === 'SUCCESS') {
                showMessage('SUCCESS', responseBody.messages[0]);
                $('#newCostModal').removeClass('is-active');
                $('#newCostForm').trigger('reset');
                $('#newCostForm #purchaseDate').val(new Date());
                if (mobile) {
                    costTableMobile.ajax.reload();
                } else {
                    costTable.ajax.reload();
                }
            } else {
                var data = JSON.parse(responseBody.data);
                console.table(data);
            }
        }).fail(function () {
            showAjaxFailedMessage();
        });
    });

    $(document).on('click', '._delete', function () {
        selectedId = $(this).closest('tr').data('id');
        $('#confirmDeleteMessage').html('Xóa chi phí ngày: <b>'
            + $(this).closest('tr').data('purchase-date') + '</b><br/>' + $(this).closest('tr').data('name') + '<br/>'
            + 'Số lượng: ' + $(this).closest('tr').data('quantity'));
        $('#deleteModal').addClass('is-active');
    })

    $(document).on('click', '#_delete', function () {
        selectedId = $(selectedRow).data('id')
        $('#confirmDeleteMessage').html('Xóa chi phí ngày: <b>'
            + $(selectedRow).data('purchase-date') + '</b><br/>' + $(selectedRow).data('name') + '<br/>'
            + 'Số lượng: ' + $(selectedRow).data('quantity'));
        $('#deleteModal').addClass('is-active');
    })

    $('#delete').on('click', function () {
        $.ajax({
            url: "/cost/delete",
            type: "POST",
            data: {selectedId: selectedId}
        }).done(function (ajaxResponse, status) {
            if (ajaxResponse.code === 'SUCCESS') {
                $('#deleteModal').removeClass('is-active');
                $('#updateCostModal').removeClass('is-active');
            }

            if (mobile) {
                costTableMobile.ajax.reload();
            } else {
                costTable.ajax.reload();
            }
            showAjaxMessage(ajaxResponse);
        }).fail(function (ajaxResponse, status) {
            $('#deleteModal').removeClass('is-active');
            showAjaxFailedMessage();
        })
    });

    $(document).on('click', '#costTableMobile p.tag, #costTable p.tag', function (event) {
        window.open('/category/detail?categoryId=' + $(this).data('id'), '_blank');
    })

    $(document).on('click', '#search', function () {
        if (mobile) {
            costTableMobile.ajax.reload();
        } else {
            costTable.ajax.reload();
        }
    })

    $(document).on('change', '#file', function () {
        var file = document.getElementById('file').files[0];
        var formData = new FormData();
        formData.append("file", file);

        $.ajax({
            url: '/file/uploadInvoice',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function (responseBody, status) {
            console.log(responseBody)
            if (responseBody.code === 'SUCCESS') {
                showMessage('SUCCESS', responseBody.messages[0]);
                var data = JSON.parse(responseBody.data);
                console.log(data)
                $('#invoiceUrl').val(data.downloadUrl);
                $('#currentImage').attr('src', data.downloadUrl);
            } else {
                var data = JSON.parse(responseBody.data);
                console.table(data);
            }
        }).fail(function () {
            showAjaxFailedMessage();
        });
    });

    $(document).on('change', '#_file', function () {
        var file = document.getElementById('_file').files[0];
        var formData = new FormData();
        formData.append("file", file);

        $.ajax({
            url: '/file/uploadInvoice',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function (responseBody, status) {
            console.log(responseBody)
            if (responseBody.code === 'SUCCESS') {
                showMessage('SUCCESS', responseBody.messages[0]);
                var data = JSON.parse(responseBody.data);
                console.log(data)
                $('#_invoiceUrl').val(data.downloadUrl);
                $('#_currentImage').attr('src', data.downloadUrl);
            } else {
                var data = JSON.parse(responseBody.data);
                console.table(data);
            }
        }).fail(function () {
            showAjaxFailedMessage();
        });
    });
})

function calculateCost(_quantity, _pricePerUnit, object) {
    var quantity = transformDecimal(_quantity);
    var pricePerUnit = removeDot(_pricePerUnit);
    var cost;

    if (pricePerUnit === '') $(object).val('');

    if (pricePerUnit !== undefined && quantity !== undefined) {
        cost = pricePerUnit * quantity;
        if (cost !== 0) {
            $(object).val(cost.toFixed(0));
            formatNumber(object);
        }
    }
}

function transformDecimal(decimalNumber) {
    decimalNumber = removeDot(decimalNumber);

    if (decimalNumber.indexOf(DECIMAL_PLACE) > 0) {
        return decimalNumber.replace(DECIMAL_PLACE, '.');
    }

    return decimalNumber;
}

function resetCategoryTag(componentId) {
    $('#' + componentId + ' input').each(function (index, element) {
        $(this).attr("name", "categoryIds[" + index + "]");
    });
}