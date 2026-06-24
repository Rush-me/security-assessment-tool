package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private IsraProject project;

    @Column(name = "asset_id", nullable = false)
    private Integer assetId;

    @Column(name = "asset_name", nullable = false)
    private String assetName;

    @Column(name = "asset_type")
    private String assetType;

    @Column(name = "asset_description", columnDefinition = "LONGTEXT")
    private String assetDescription;

    // CIA Properties
    @Column(name = "confidentiality")
    private Integer confidentiality;

    @Column(name = "integrity")
    private Integer integrity;

    @Column(name = "availability")
    private Integer availability;

    @Column(name = "authenticity")
    private Integer authenticity;

    @Column(name = "authorization")
    private Integer authorization;

    @Column(name = "non_repudiation")
    private Integer nonRepudiation;
}
