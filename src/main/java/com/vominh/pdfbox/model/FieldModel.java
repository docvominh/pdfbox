package com.vominh.pdfbox.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FieldModel {
    private String name;
    private String type;
    private String value;
}
