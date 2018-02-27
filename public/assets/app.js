$(function(){


    $mainForm = $("#main_form");
    $tableAppend = $("#table-append");
    $mainAppend = $("#main");
    $splashContainer = $("#splash");
    
    $mainAppend.hide();
    $tableAppend.html("");

    setTimeout(function(){
        $splashContainer.fadeOut();
    },2000);

    $mainForm.on("submit",function(ev){
        ev.preventDefault();
        var inputs = $(this).find("input[type=text]");
        var send = {}
        for(var i = 0; i < inputs.length; i++) {
            console.log(inputs[i].name);
            send[inputs[i].name] = inputs[i].value;
        }
        console.log(send);
        $.ajax({
            method: "POST",
            url: "/hitung",
            data: send,
            success: function(data){
                console.log(data);
                console.table(data.pembagian);

                var main = data.main;
            
                $("#ip_bin").text(main.ipAddressBin);
                $("#mask_bin").text(main.subnetMaskBin);
                $("#mask_dec").text(main.subnetMask);
                $("#net_bin").text(main.networkAddressBin);
                $("#net_dec").text(main.networkAddress);
                $("#first_ip").text(main.firstAddress);
                $("#last_ip").text(main.lastAddress);
                $("#broadcast").text(main.broadcastAddress);
                $("#nobh").text(32 - $(".subnet").val());
                $("#noh").text(main.numHosts);


                var table = "<table border='1px' cellpadding='10px' width='100%'>";
                table += "<thead><tr>"
                table += "<td>Number of host</td>";
                table += "<td>IP Subnet</td>";
                table += "<td>First IP Host</td>";
                table += "<td>Last IP Host</td>";
                table += "<td>Broadcast</td>";
                table += "<td>Subnet Mask</td>";
                table += "<td>CIDR</td>";
                table += "</tr></thead>";
                for(var i = 0; i < data.pembagian.length; i++) {
                    var pemb = data.pembagian[i];
                    console.log(pemb);
                    table += "<tr>";
                    table += `<td>${pemb.number_of_hosts}</td>`;
                    table += `<td>${pemb.ip_subnet}</td>`;
                    table += `<td>${pemb.first_ip_host}</td>`;
                    table += `<td>${pemb.last_ip_host}</td>`;
                    table += `<td>${pemb.broadcast}</td>`;
                    table += `<td>${pemb.subnetmask}</td>`;
                    table += `<td>${pemb.cidr}</td>`;
                    table += "</tr>";
                }
                table += "</table>";
                $tableAppend.html(table);
                $mainAppend.show();
            }
        });
    });

});